<script lang="ts">
	import type { Claim, Debate } from '$lib/types';
	import ClaimNode from './ClaimNode.svelte';
	import ClaimForm from './ClaimForm.svelte';
	import RichTextDisplay from './RichTextDisplay.svelte';
	import { auth } from '$lib/stores/auth';

	export let debateId: string;
	export let debate: Debate | null;
	export let claims: Claim[];
	export let onVote: (claimId: string, dimension: any, value: number) => void;
	export let onClaimCreated: () => void;

	let showFattoForm = false;
	let showProForm = false;
	let showControForm = false;
	let expandedClaimId: string | null = null;

	// Separa le claims per tipo
	$: fatti = claims.filter(c => (c.type === 'fatto' || c.type === 'neutro') && !c.parent_id);
	$: proClaims = claims.filter(c => c.type === 'pro' && !c.parent_id);
	$: controClaims = claims.filter(c => c.type === 'contro' && !c.parent_id);

	function toggleExpand(claimId: string) {
		expandedClaimId = expandedClaimId === claimId ? null : claimId;
	}

	function handleFormSuccess() {
		showFattoForm = false;
		showProForm = false;
		showControForm = false;
		onClaimCreated();
	}
</script>

<div class="debate-layout">
	<!-- Domanda del dibattito -->
	<div class="debate-question-card">
		{#if debate}
			<h1 class="text-3xl font-bold text-gray-900 mb-3">{debate.title}</h1>
			<h2 class="text-xl font-semibold text-gray-700 mb-3">{debate.question}</h2>
			{#if debate.description}
				<div class="debate-description">
					<RichTextDisplay content={debate.description} />
				</div>
			{/if}
		{:else}
			<h2 class="text-2xl font-bold text-gray-900 mb-2">Caricamento...</h2>
		{/if}
	</div>

	<!-- Sezione FATTI (full-width, grigio) -->
	<div class="fatti-section">
		<div class="section-header bg-gray-100 border-l-4 border-gray-500">
			<h3 class="text-lg font-semibold text-gray-800">📊 FATTI</h3>
			<p class="text-sm text-gray-600">Informazioni verificabili</p>
		</div>

		{#if $auth.user && !showFattoForm}
			<button 
				class="add-claim-btn bg-gray-600 hover:bg-gray-700"
				on:click={() => showFattoForm = true}
			>
				+ Aggiungi Fatto
			</button>
		{/if}

		{#if showFattoForm}
			<ClaimForm 
				{debateId}
				parentId={null}
				claimType="fatto"
				onSuccess={handleFormSuccess}
				onCancel={() => showFattoForm = false}
			/>
		{/if}

		<div class="claims-list">
			{#each fatti as fatto (fatto.id)}
				<ClaimNode 
					claim={fatto}
					depth={0}
					{onVote}
					{debateId}
					{onClaimCreated}
				/>
			{/each}
			{#if fatti.length === 0 && !showFattoForm}
				<p class="text-sm text-gray-500 italic">Nessun fatto ancora inserito</p>
			{/if}
		</div>
	</div>

	<!-- Layout a 2 colonne: PRO e CONTRO -->
	<div class="two-column-layout">
		<!-- Colonna PRO (sinistra, verde) -->
		<div class="column pro-column">
			<div class="section-header bg-green-100 border-l-4 border-green-500">
				<h3 class="text-lg font-semibold text-green-800">✓ PRO</h3>
				<p class="text-sm text-green-700">Argomentazioni a favore</p>
			</div>

			{#if $auth.user && !showProForm}
				<button 
					class="add-claim-btn bg-green-600 hover:bg-green-700"
					on:click={() => showProForm = true}
				>
					+ Aggiungi Pro
				</button>
			{/if}

			{#if showProForm}
				<ClaimForm 
					{debateId}
					parentId={null}
					claimType="pro"
					onSuccess={handleFormSuccess}
					onCancel={() => showProForm = false}
				/>
			{/if}

			<div class="claims-list">
				{#each proClaims as claim (claim.id)}
					<ClaimNode 
						{claim}
						depth={0}
						{onVote}
						{debateId}
						{onClaimCreated}
					/>
				{/each}
				{#if proClaims.length === 0 && !showProForm}
					<p class="text-sm text-gray-500 italic">Nessuna argomentazione pro ancora inserita</p>
				{/if}
			</div>
		</div>

		<!-- Colonna CONTRO (destra, rossa) -->
		<div class="column contro-column">
			<div class="section-header bg-red-100 border-l-4 border-red-500">
				<h3 class="text-lg font-semibold text-red-800">✗ CONTRO</h3>
				<p class="text-sm text-red-700">Argomentazioni contrarie</p>
			</div>

			{#if $auth.user && !showControForm}
				<button 
					class="add-claim-btn bg-red-600 hover:bg-red-700"
					on:click={() => showControForm = true}
				>
					+ Aggiungi Contro
				</button>
			{/if}

			{#if showControForm}
				<ClaimForm 
					{debateId}
					parentId={null}
					claimType="contro"
					onSuccess={handleFormSuccess}
					onCancel={() => showControForm = false}
				/>
			{/if}

			<div class="claims-list">
				{#each controClaims as claim (claim.id)}
					<ClaimNode 
						{claim}
						depth={0}
						{onVote}
						{debateId}
						{onClaimCreated}
					/>
				{/each}
				{#if controClaims.length === 0 && !showControForm}
					<p class="text-sm text-gray-500 italic">Nessuna argomentazione contro ancora inserita</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.debate-layout {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.debate-question-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.debate-description {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
		text-align: left;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.fatti-section {
		background: #fafafa;
		border: 2px solid #d1d5db;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.section-header {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.two-column-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 768px) {
		.two-column-layout {
			grid-template-columns: 1fr;
		}
	}

	.column {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		min-height: 400px;
	}

	.pro-column {
		border-color: #86efac;
	}

	.contro-column {
		border-color: #fca5a5;
	}

	.add-claim-btn {
		width: 100%;
		padding: 0.75rem;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1rem;
	}

	.claims-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
