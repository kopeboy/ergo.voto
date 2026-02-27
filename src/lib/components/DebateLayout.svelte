<script lang="ts">
	import type { Argument, Debate } from '$lib/types';
	import ArgumentNode from './ArgumentNode.svelte';
	import ArgumentForm from './ArgumentForm.svelte';
	import { auth } from '$lib/stores/auth';

	export let debateId: number;
	export let debate: Debate | null;
	export let argumentsList: Argument[];

	let showProForm = false;
	let showControForm = false;
	let expandedArgument: Argument | null = null;
	let isColumnExpanded = false;

	$: debateType = debate?.type || 'claim';
	$: proLabel = debateType === 'question' ? 'Sì' : 'Pro';
	$: controLabel = debateType === 'question' ? 'No' : 'Contro';
	$: proArguments = argumentsList.filter(a => !a.is_objection && !a.parent);
	$: controArguments = argumentsList.filter(a => a.is_objection && !a.parent);

	function handleExpandArgument(argument: Argument) {
		expandedArgument = argument;
	}

	function handleCollapseArgument() {
		expandedArgument = null;
	}

	function handleFormClose() {
		showProForm = false;
		showControForm = false;
	}

	async function handleArgumentCreated(newArgument: any) {
		handleFormClose();
		
		// Add new argument optimistically to the list
		argumentsList = [...argumentsList, newArgument];
		
		// Wait for DOM update, then scroll to and highlight the new argument
		setTimeout(() => {
			const element = document.getElementById(`argument-${newArgument.id}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
				element.classList.add('highlight-new');
				setTimeout(() => element.classList.remove('highlight-new'), 1000);
			}
		}, 100);
	}
</script>

<div class="debate-container max-w-7xl mx-auto px-4 py-8">
	<!-- Debate header -->
	{#if debate}
		<div class="debate-header mb-8">
			<h1 class="debate-topic text-3xl font-bold mb-3 text-center">{debate.topic}</h1>
			{#if debate.intro}
				<p class="debate-intro text-base text-gray-700 max-w-3xl mx-auto mb-4">
					{debate.intro}
				</p>
			{/if}
		</div>
		
		<!-- Sticky container for claim and controls -->
		<div class="sticky-controls sticky top-0 z-20 bg-white border border-gray-200 rounded-lg shadow-sm pb-3 mb-2">
			<!-- Debate claim/question with Si/No buttons -->
			<div class="debate-claim bg-white p-4 mb-2 flex items-center justify-between gap-6">
				{#if $auth.user}
					<button
						class="claim-button px-6 py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors text-lg"
						onclick={() => showProForm = true}
					>
						{proLabel}
					</button>
				{/if}
				<div class="flex-1 text-center">
					{#if debateType === 'question' && debate.question}
						<h2 class="claim-text text-xl font-bold text-gray-900">{debate.question}</h2>
					{:else if debateType === 'claim' && debate.claim}
						<h2 class="claim-text text-xl font-bold text-gray-900">{debate.claim}</h2>
					{/if}
				</div>
				{#if $auth.user}
					<button
						class="claim-button px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors text-lg"
						onclick={() => showControForm = true}
					>
						{controLabel}
					</button>
				{/if}
			</div>

			<!-- Search and select controls -->
			{#if $auth.user}
				<div class="search-controls flex gap-2 items-center justify-center">
					<input
						type="text"
						placeholder="Cerca..."
						class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
					/>
					<button class="px-2 py-1 text-xs rounded-md font-medium cursor-pointer border border-gray-300 hover:bg-gray-50 transition-colors">
						Seleziona
					</button>
				</div>
			{/if}
		</div>


	<div class="arguments-grid grid grid-cols-2 gap-4 relative" onclick={(e) => {
		if (expandedArgument && e.target === e.currentTarget) {
			handleCollapseArgument();
		}
	}}>
		<!-- Pro Column -->
		<div 
			class="argument-column pro-column border rounded-lg transition-all duration-500 relative p-6"
			class:column-expanded={expandedArgument && !expandedArgument.is_objection}
			class:column-collapsed={expandedArgument && expandedArgument.is_objection}
			onclick={(e) => {
				if (expandedArgument && expandedArgument.is_objection && e.target === e.currentTarget) {
					e.stopPropagation();
					handleCollapseArgument();
				}
			}}
		>
			<div class="space-y-3">
				{#each proArguments as argument (argument.id)}
					<ArgumentNode {argument} {debateId} depth={0} isExpanded={expandedArgument?.id === argument.id} inColumnExpanded={!!(expandedArgument && !expandedArgument.is_objection)} onExpand={handleExpandArgument} />
				{/each}
				{#if proArguments.length === 0}
					<p class="text-sm text-gray-500 italic">Nessun argomento ancora inserito</p>
				{/if}
			</div>
		</div>

		<!-- Contro Column -->
		<div 
			class="argument-column contro-column border rounded-lg transition-all duration-500 relative p-6"
			class:column-expanded={expandedArgument && expandedArgument.is_objection}
			class:column-collapsed={expandedArgument && !expandedArgument.is_objection}
			onclick={(e) => {
				if (expandedArgument && !expandedArgument.is_objection && e.target === e.currentTarget) {
					e.stopPropagation();
					handleCollapseArgument();
				}
			}}
		>
			<div class="space-y-3">
				{#each controArguments as argument (argument.id)}
					<ArgumentNode {argument} {debateId} depth={0} isExpanded={expandedArgument?.id === argument.id} inColumnExpanded={!!(expandedArgument && expandedArgument.is_objection)} onExpand={handleExpandArgument} />
				{/each}
				{#if controArguments.length === 0}
					<p class="text-sm text-gray-500 italic">Nessun argomento ancora inserito</p>
				{/if}
			</div>
		</div>
	</div>
	{/if}
</div>

<style>
	.arguments-grid {
		position: relative;
	}
	
	.argument-column {
		position: relative;
	}
	
	.column-expanded {
		position: absolute;
		top: 0;
		width: 80vw;
		z-index: 30;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
	}
	
	.pro-column {
		grid-column: 1;
	}
	
	.contro-column {
		grid-column: 2;
	}
	
	.pro-column.column-expanded {
		left: 0;
		right: auto;
	}
	
	.contro-column.column-expanded {
		left: auto;
		right: 0;
	}
	
	/* Column backgrounds and borders */
	.pro-column {
		border-color: rgba(34, 197, 94, 0.4) !important;
		background: #f0fdf4 !important;
	}
	
	.contro-column {
		border-color: rgba(239, 68, 68, 0.4) !important;
		background: #fef2f2 !important;
	}
	
	.column-collapsed {
		z-index: 10;
	}
	
	.column-collapsed {
		cursor: pointer;
		opacity: 0.3;
		pointer-events: none;
	}
</style>

{#if showProForm}
	<ArgumentForm
		{debateId}
		parentId={null}
		isObjection={false}
		onClose={handleFormClose}
		onSuccess={handleArgumentCreated}
	/>
{/if}

{#if showControForm}
	<ArgumentForm
		{debateId}
		parentId={null}
		isObjection={true}
		onClose={handleFormClose}
		onSuccess={handleArgumentCreated}
	/>
{/if}

