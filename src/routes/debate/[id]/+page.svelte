<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ClaimNode from '$lib/components/ClaimNode.svelte';
	import type { Claim, VoteDimension } from '$lib/types';
	import { getDebateTree } from '$lib/api';
	import { upsertVote } from '$lib/api/votes';
	import { auth } from '$lib/stores/auth';

	let debateId = $page.params.id || '1';
	let claims: Claim[] = [];
	let loading = true;
	let error: string | null = null;

	// Carica i dati dal backend
	onMount(async () => {
		try {
			loading = true;
			claims = await getDebateTree(debateId);
		} catch (err) {
			console.error('Error loading debate:', err);
			error = 'Errore nel caricamento del dibattito. Riprova più tardi.';
		} finally {
			loading = false;
		}
	});

	const handleVote = async (claimId: string, dimension: VoteDimension, value: number) => {
		// Verifica autenticazione
		if (!$auth.user) {
			alert('Per votare devi effettuare il login.');
			return;
		}

		// Aggiornamento ottimistico locale
		claims = updateVoteRecursive(claims, claimId, dimension, value);
		
		// Salva sul backend
		try {
			await upsertVote(claimId, dimension, value);
		} catch (err) {
			console.error('Error saving vote:', err);
			// Rollback ottimistico in caso di errore
			claims = updateVoteRecursive(claims, claimId, dimension, -value);
			alert('Errore nel salvataggio del voto. Riprova.');
		}
	};

	function updateVoteRecursive(claimsList: Claim[], targetId: string, dimension: VoteDimension, value: number): Claim[] {
		return claimsList.map(claim => {
			if (claim.id === targetId) {
				return {
					...claim,
					votes: {
						...claim.votes,
						[dimension]: claim.votes[dimension] + value
					}
				};
			}
			if (claim.children && claim.children.length > 0) {
				return {
					...claim,
					children: updateVoteRecursive(claim.children, targetId, dimension, value)
				};
			}
			return claim;
		});
	}
</script>

<svelte:head>
	<title>Dibattito #{debateId} - Ergo.voto</title>
</svelte:head>

<div class="debate-container">
	<header class="debate-header">
		<h1 class="debate-title">Dibattito sul Cambiamento Climatico</h1>
		<p class="debate-description">
			Esplora le argomentazioni strutturate e vota sulle dimensioni di Accuratezza e Rilevanza.
		</p>
	</header>

	{#if loading}
		<div class="loading">
			<p>Caricamento dibattito...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{:else if claims.length === 0}
		<div class="empty">
			<p>Nessun claim pubblicato in questo dibattito.</p>
			<p class="text-sm text-gray-600">Sii il primo a contribuire!</p>
		</div>
	{:else}
		<div class="claims-tree">
			{#each claims as claim (claim.id)}
				<ClaimNode {claim} depth={0} onVote={handleVote} />
			{/each}
		</div>
	{/if}

	<div class="info-panel">
		<h3 class="info-title">Come funziona il voto multi-dimensionale?</h3>
		<ul class="info-list">
			<li><strong>Accuratezza:</strong> Quanto è accurata e supportata da evidenze questa affermazione?</li>
			<li><strong>Rilevanza:</strong> Quanto è pertinente al dibattito principale?</li>
		</ul>
		<p class="info-note">
			💡 I voti sono ottimistici: vedrai il cambiamento immediatamente nel browser.
		</p>
	</div>
</div>

<style>
	.debate-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.debate-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.debate-title {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.debate-description {
		font-size: 1.125rem;
		color: #6b7280;
		line-height: 1.6;
	}

	.claims-tree {
		margin-bottom: 2rem;
	}

	.loading, .error, .empty {
		text-align: center;
		padding: 3rem 1rem;
		color: #6b7280;
	}

	.error {
		color: #dc2626;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
	}

	.empty {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.info-panel {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-top: 2rem;
	}

	.info-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 1rem;
	}

	.info-list {
		list-style: none;
		padding: 0;
		margin-bottom: 1rem;
	}

	.info-list li {
		padding: 0.5rem 0;
		color: #374151;
		line-height: 1.6;
	}

	.info-note {
		background: #eff6ff;
		border-left: 4px solid #3b82f6;
		padding: 0.75rem 1rem;
		margin-top: 1rem;
		color: #1e40af;
		border-radius: 0.25rem;
	}

	@media (max-width: 768px) {
		.debate-container {
			padding: 1rem 0.5rem;
		}

		.debate-title {
			font-size: 1.5rem;
		}

		.debate-description {
			font-size: 1rem;
		}
	}
</style>
