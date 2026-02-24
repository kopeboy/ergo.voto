<script lang="ts">
	import { onMount } from 'svelte';
	import { getDebates } from '$lib/api/debates';
	import type { Debate } from '$lib/types';

	let debates: Debate[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			loading = true;
			debates = await getDebates();
		} catch (err) {
			console.error('Error loading debates:', err);
			error = 'Errore nel caricamento dei dibattiti. Riprova più tardi.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Dibattiti - Ergo.voto</title>
</svelte:head>

<div class="debates-container">
	<header class="debates-header">
		<h1 class="debates-title">Dibattiti</h1>
		<p class="debates-description">
			Esplora i dibattiti attivi e partecipa alla discussione strutturata.
		</p>
	</header>

	{#if loading}
		<div class="loading">
			<p>Caricamento dibattiti...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{:else if debates.length === 0}
		<div class="empty">
			<p>Nessun dibattito pubblicato al momento.</p>
			<p class="text-sm">Torna più tardi per nuovi dibattiti!</p>
		</div>
	{:else}
		<div class="debates-grid">
			{#each debates as debate (debate.id)}
				<a href="/debate/{debate.id}" class="debate-card">
					<h2 class="debate-title">{debate.title}</h2>
					<p class="debate-question">{debate.question}</p>
					{#if debate.description}
						<p class="debate-description">{debate.description}</p>
					{/if}
					<div class="debate-footer">
						<span class="debate-status">{debate.status}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.debates-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.debates-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.debates-title {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.debates-description {
		font-size: 1.125rem;
		color: #6b7280;
		line-height: 1.6;
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

	.text-sm {
		font-size: 0.875rem;
		color: #9ca3af;
		margin-top: 0.5rem;
	}

	.debates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.debate-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		text-decoration: none;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.debate-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.debate-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.debate-question {
		font-size: 1rem;
		color: #374151;
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.debate-description {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.5;
		margin: 0;
	}

	.debate-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.debate-status {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background: #dbeafe;
		color: #1e40af;
	}

	@media (max-width: 768px) {
		.debates-container {
			padding: 1rem 0.5rem;
		}

		.debates-title {
			font-size: 1.5rem;
		}

		.debates-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
