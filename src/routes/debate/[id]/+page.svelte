<script lang="ts">
	import { page } from '$app/stores';
	import ClaimNode from '$lib/components/ClaimNode.svelte';
	import type { Claim, VoteDimension } from '$lib/types';
	import { mockDebateData } from '$lib/mockData';

	let debateId = $page.params.id;
	let claims: Claim[] = mockDebateData;

	const handleVote = (claimId: string, dimension: VoteDimension, value: number) => {
		claims = updateVoteRecursive(claims, claimId, dimension, value);
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

	<div class="claims-tree">
		{#each claims as claim (claim.id)}
			<ClaimNode {claim} depth={0} onVote={handleVote} />
		{/each}
	</div>

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
