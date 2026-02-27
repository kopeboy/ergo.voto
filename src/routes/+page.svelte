<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { getDebates } from '$lib/api/debates';
	import DebateForm from '$lib/components/DebateForm.svelte';
	import type { Debate } from '$lib/types';

	let debates: Debate[] = [];
	let loading = true;
	let showDebateForm = false;

	async function loadDebates() {
		try {
			loading = true;
			debates = await getDebates();
		} catch (err) {
			console.error('Error loading debates:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadDebates);

	async function handleDebateCreated() {
		showDebateForm = false;
		await loadDebates();
	}

	// Only Pro Users can create debates
	$: canCreateDebate = ($auth.user?.role ?? '').trim().toLowerCase() === 'pro user';
</script>

<div class="home-container">
	<header class="hero">
		<h1 class="hero-title">Ergo.voto</h1>
		<p class="hero-subtitle">Piattaforma per Dibattiti Strutturati</p>
		<p class="hero-description">
			Esplora argomentazioni gerarchiche con voto semplice e fonti verificabili.
		</p>
	</header>

	<section class="debates-section">
		<div class="section-header">
			<h2 class="section-title">Dibattiti Attivi</h2>
			{#if canCreateDebate && !showDebateForm}
				<button class="btn-create-debate" on:click={() => showDebateForm = true}>
					+ Crea Dibattito
				</button>
			{/if}
		</div>

		{#if showDebateForm}
			<DebateForm 
				onSuccess={handleDebateCreated}
				onCancel={() => showDebateForm = false}
			/>
		{/if}

		{#if loading}
			<p class="text-gray-500">Caricamento...</p>
		{:else if debates.length === 0}
			<p class="text-gray-500">Nessun dibattito disponibile al momento.</p>
		{:else}
			<div class="debates-grid">
				{#each debates as debate (debate.id)}
					<div class="debate-card">
						<h3 class="debate-card-title">{debate.topic}</h3>
						<div class="debate-card-description">
							{#if debate.type === 'question' && debate.question}
								<p class="font-semibold text-gray-700 mb-2">{debate.question}</p>
							{:else if debate.type === 'claim' && debate.claim}
								<p class="font-semibold text-gray-700 mb-2">{debate.claim}</p>
							{/if}
							{#if debate.intro}
								<p class="text-gray-600">{debate.intro}</p>
							{/if}
						</div>
						{#if debate.tags && debate.tags.length > 0}
							<div class="debate-tags">
								{#each debate.tags as tag}
									<span class="debate-tag">{tag}</span>
								{/each}
							</div>
						{/if}
						<a href="/debate/{debate.id}" class="debate-link">
							Partecipa al dibattito →
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="features-section">
		<h2 class="section-title">Caratteristiche</h2>
		<div class="features-grid">
			<div class="feature">
				<div class="feature-icon">🌳</div>
				<h3 class="feature-title">Struttura Gerarchica</h3>
				<p class="feature-description">Argomentazioni organizzate in alberi Pro/Contro</p>
			</div>
			<div class="feature">
				<div class="feature-icon">📊</div>
				<h3 class="feature-title">Voto Semplice</h3>
				<p class="feature-description">Vota +1 o -1 per ogni argomento</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🔗</div>
				<h3 class="feature-title">Fonti Verificabili</h3>
				<p class="feature-description">Ogni argomento può avere fonti con citazioni</p>
			</div>
		</div>
	</section>
</div>

<style>
	.home-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.hero {
		text-align: center;
		padding: 3rem 1rem;
		margin-bottom: 3rem;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 800;
		color: #111827;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.5rem;
		color: #6b7280;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.hero-description {
		font-size: 1.125rem;
		color: #9ca3af;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.debates-section {
		margin-bottom: 3rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.btn-create-debate {
		background: #eab308;
		color: white;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
	}

	.btn-create-debate:hover {
		background: #ca8a04;
		box-shadow: 0 4px 8px rgba(234, 179, 8, 0.3);
	}

	.debates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.debate-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
	}

	.debate-card:hover {
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.debate-card-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.75rem;
	}

	.debate-card-description {
		color: #6b7280;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.debate-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.debate-tag {
		background: #fef3c7;
		color: #92400e;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.debate-link {
		display: inline-block;
		background: #3b82f6;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		transition: background 0.2s;
	}

	.debate-link:hover {
		background: #2563eb;
	}

	.features-section {
		margin-bottom: 3rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature {
		text-align: center;
		padding: 2rem;
		background: #f9fafb;
		border-radius: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.75rem;
	}

	.feature-description {
		color: #6b7280;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.25rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
