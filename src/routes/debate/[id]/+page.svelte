<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getDebateTree } from '$lib/api';
	import { getDebate } from '$lib/api/debates';
	import { voteWithCache, loadUserVotesForClaims } from '$lib/stores/votes';
	import { userVotesStore } from '$lib/stores/votes';
	import DebateLayout from '$lib/components/DebateLayout.svelte';
	import type { Claim, VoteDimension, Debate } from '$lib/types';
	import { auth } from '$lib/stores/auth';

	let debateId = $page.params.id || '1';
	let claims: Claim[] = [];
	let debate: Debate | null = null;
	let loading = true;
	let error: string | null = null;

	// Funzione ricorsiva per estrarre tutti gli ID delle claim
	function extractAllClaimIds(claimsList: Claim[]): string[] {
		const ids: string[] = [];
		for (const claim of claimsList) {
			ids.push(claim.id);
			if (claim.children?.length) {
				ids.push(...extractAllClaimIds(claim.children));
			}
		}
		return ids;
	}

	// Carica i dati dal backend
	async function loadDebate() {
		try {
			loading = true;
			
			// Carica i dati del dibattito e l'albero delle claims in parallelo
			const [debateData, tree] = await Promise.all([
				getDebate(debateId),
				getDebateTree(debateId)
			]);
			
			debate = debateData;
			claims = tree;
			
			// Se l'utente è loggato, carica i suoi voti per le claim visibili
			if ($auth.user && claims.length > 0) {
				const claimIds = extractAllClaimIds(claims);
				await loadUserVotesForClaims(claimIds);
			}
			
			error = null;
		} catch (err) {
			error = 'Errore nel caricamento del dibattito';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(loadDebate);

	// Track previous auth state to detect login/logout
	let previousAuthState = $auth.user;
	$: {
		// Reload only when auth state actually changes (login or logout)
		if (previousAuthState !== $auth.user && !$auth.loading) {
			previousAuthState = $auth.user;
			if (typeof window !== 'undefined') {
				loadDebate();
			}
		}
	}

	// Callback dopo creazione claim
	async function handleClaimCreated() {
		await loadDebate();
	}

	const handleVote = async (claimId: string, dimension: VoteDimension, value: number) => {
		// Verifica autenticazione
		if (!$auth.user) {
			alert('Per votare devi effettuare il login.');
			return;
		}

		// Calcola delta ottimistico basato sulla cache dei voti utente
		const userVote = $userVotesStore.get(claimId);
		const currentValue = userVote?.[dimension] || 0;
		const optimisticFinalValue = currentValue === value ? 0 : value;
		const optimisticDelta = optimisticFinalValue - currentValue;

		// Aggiornamento ottimistico UI
		claims = updateVoteRecursive(claims, claimId, dimension, optimisticDelta);

		// Salva sul backend
		try {
			await voteWithCache(claimId, dimension, value);
		} catch (err) {
			console.error('Error saving vote:', err);
			// Rollback ottimistico
			claims = updateVoteRecursive(claims, claimId, dimension, -optimisticDelta);
			alert('Errore nel salvataggio del voto. Riprova.');
		}
	};

	// Aggiorna il voto di un claim specifico nell'albero
	// La ricorsione serve solo per trovare il claim, non per applicare il voto ai figli
	function updateVoteRecursive(claimsList: Claim[], targetId: string, dimension: VoteDimension, value: number): Claim[] {
		return claimsList.map(claim => {
			// Trovato il claim target - aggiorna solo questo
			if (claim.id === targetId) {
				return {
					...claim,
					votes: {
						...claim.votes,
						[dimension]: claim.votes[dimension] + value
					}
				};
			}
			// Non è il target - cerca nei figli se esistono
			if (claim.children?.length) {
				return {
					...claim,
					children: updateVoteRecursive(claim.children, targetId, dimension, value)
				};
			}
			// Non è il target e non ha figli - restituisci invariato
			return claim;
		});
	}
</script>

<svelte:head>
	<title>{debate?.title || `Dibattito #${debateId}`} - Ergo.voto</title>
</svelte:head>

{#if loading}
	<div class="loading">
		<p>Caricamento dibattito...</p>
	</div>
{:else if error}
	<div class="error">
		<p>{error}</p>
	</div>
{:else}
	<DebateLayout 
		{debateId}
		{debate}
		{claims}
		onVote={handleVote}
		onClaimCreated={handleClaimCreated}
	/>

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
{/if}

<style>
	.loading, .error {
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

	.info-panel {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-top: 2rem;
		max-width: 1400px;
		margin-left: auto;
		margin-right: auto;
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
</style>
