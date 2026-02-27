<script lang="ts">
	import type { Argument } from '$lib/types';
	import { upsertVote, getUserVote } from '$lib/api';
	import { auth } from '$lib/stores/auth';
	import SourceModal from './SourceModal.svelte';
	import ArgumentForm from './ArgumentForm.svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';

	export let argument: Argument;
	export let debateId: number;
	export let onExpand: ((arg: Argument) => void) | undefined = undefined;
	export let isExpanded: boolean = false;
	export let depth: number = 0;
	export let inColumnExpanded: boolean = false;
	
	let expandedChildId: number | null = null;

	let showConfirmations = false;
	let showObjections = false;
	let showConfirmationForm = false;
	let showObjectionForm = false;
	let highlightedChildId: number | null = null;
	let selectedSourceIndex: number | null = null;
	let votingInProgress = false;
	let userVote: number = 0;

	$: confirmations = argument.children?.filter(a => !a.is_objection) || [];
	$: objections = argument.children?.filter(a => a.is_objection) || [];
	$: sources = argument.sources || [];

	function toggleExpanded() {
		if (onExpand) {
			// If already expanded, collapse it by passing null
			if (isExpanded) {
				onExpand(null as any);
			} else {
				onExpand(argument);
			}
		}
	}

	function handleChildClick(child: Argument) {
		// Toggle expansion of child
		if (expandedChildId === child.id) {
			expandedChildId = null;
		} else {
			expandedChildId = child.id;
			highlightedChildId = child.id;
			
			setTimeout(() => {
				highlightedChildId = null;
			}, 1000);
		}
	}
	
	function handleChildExpand(child: Argument | null) {
		if (child) {
			expandedChildId = child.id;
		} else {
			expandedChildId = null;
		}
	}

	onMount(async () => {
		if ($auth.user) {
			const vote = await getUserVote(argument.id, $auth.user.id);
			userVote = vote?.vote || 0;
		}
	});

	async function handleVote(value: 1 | -1) {
		if (!$auth.user) {
			alert('Devi effettuare il login per votare');
			return;
		}

		if (votingInProgress) return;
		votingInProgress = true;

		try {
			const delta = await upsertVote(argument.id, value, $auth.user.id);
			argument.vote_score = (argument.vote_score || 0) + delta;
			
			if (userVote === value) {
				userVote = 0;
			} else {
				userVote = value;
			}
		} catch (error) {
			console.error('Error voting:', error);
			alert('Errore durante il voto');
		} finally {
			votingInProgress = false;
		}
	}

	function toggleConfirmationForm() {
		const wasOpen = showConfirmationForm;
		showConfirmationForm = !showConfirmationForm;
		if (showConfirmationForm) {
			showObjectionForm = false;
			// Only expand if not already expanded
			if (!isExpanded && onExpand) {
				onExpand(argument);
			}
		}
	}

	function toggleObjectionForm() {
		const wasOpen = showObjectionForm;
		showObjectionForm = !showObjectionForm;
		if (showObjectionForm) {
			showConfirmationForm = false;
			// Only expand if not already expanded
			if (!isExpanded && onExpand) {
				onExpand(argument);
			}
		}
	}
</script>

<div id="argument-{argument.id}" class="argument-card bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-300 {isExpanded ? 'argument-expanded p-5 shadow-md' : 'argument-compact p-4'} {depth > 0 && isExpanded ? 'child-expanded' : ''} {depth > 0 && isExpanded && !argument.is_objection ? 'child-expanded-left' : ''} {depth > 0 && isExpanded && argument.is_objection ? 'child-expanded-right' : ''}">
	<div class="argument-main flex gap-4 {isExpanded ? 'sticky z-10 bg-white -mx-5 -mt-5 px-5 pt-5 pb-3 border-b border-gray-200' : ''}" style="{isExpanded ? 'top: 80px;' : ''}">
		<div class="argument-content flex-1">
			<div 
				class="argument-text w-full text-left leading-relaxed cursor-pointer hover:text-gray-700 transition-all duration-200 {isExpanded ? 'text-xl font-bold' : 'text-base'}"
				onclick={toggleExpanded}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && toggleExpanded()}
			>
				{argument.argument}
			</div>
				
				{#if sources.length > 0}
					<div class="mt-2 text-sm text-gray-600">
						Fonti: 
						{#each sources as source, i}
							<button
								class="ml-1 text-yellow-600 hover:underline font-medium cursor-pointer"
								onclick={() => selectedSourceIndex = i}
							>
								({i + 1})
							</button>
						{/each}
					</div>
				{/if}

			{#if !isExpanded}
				<div class="argument-actions mt-3 flex flex-wrap items-center gap-3">
					<button
						class="action-confirm text-sm font-bold cursor-pointer transition-colors underline {argument.is_objection ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}"
						onclick={(e) => {
							e.stopPropagation();
							if (confirmations.length > 0) {
								showConfirmations = !showConfirmations;
							} else {
								toggleConfirmationForm();
							}
						}}
					>
						{#if confirmations.length > 0}
							{confirmations.length} {confirmations.length === 1 ? 'Conferma' : 'Conferme'}
						{:else}
							Conferma
						{/if}
					</button>
					<button
						class="action-object text-sm font-bold cursor-pointer transition-colors underline {argument.is_objection ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}"
						onclick={(e) => {
							e.stopPropagation();
							if (objections.length > 0) {
								showObjections = !showObjections;
							} else {
								toggleObjectionForm();
							}
						}}
					>
						{#if objections.length > 0}
							{objections.length} {objections.length === 1 ? 'Obiezione' : 'Obiezioni'}
						{:else}
							Obietta
						{/if}
					</button>
					<button class="action-report text-sm font-bold cursor-pointer text-gray-800 hover:text-black transition-colors underline">
						Segnala
					</button>
				</div>
			{/if}
		</div>
		
		<div class="vote-controls flex flex-col items-center gap-0.5">
			<button
				class="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-50 cursor-pointer border {userVote === 1 ? (argument.is_objection ? 'border-red-400 bg-gradient-to-br from-red-100 to-red-200' : 'border-green-400 bg-gradient-to-br from-green-100 to-green-200') : 'border-gray-300 hover:bg-gray-100'}"
				onclick={() => handleVote(1)}
				disabled={votingInProgress}
				aria-label="Vota positivo"
			>
				<svg class="w-4 h-4 {userVote === 1 ? (argument.is_objection ? 'text-red-600' : 'text-green-600') : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10 5l5 5H5l5-5z"/>
				</svg>
			</button>
			<span class="vote-score text-sm font-bold {(argument.vote_score || 0) > 0 ? (argument.is_objection ? 'text-red-600' : 'text-green-600') : (argument.vote_score || 0) < 0 ? 'text-gray-500' : 'text-gray-600'}">
				{argument.vote_score || 0}
			</span>
			<button
				class="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-50 cursor-pointer border {userVote === -1 ? (argument.is_objection ? 'border-green-400 bg-gradient-to-br from-green-100 to-green-200' : 'border-red-400 bg-gradient-to-br from-red-100 to-red-200') : 'border-gray-300 hover:bg-gray-100'}"
				onclick={() => handleVote(-1)}
				disabled={votingInProgress}
				aria-label="Vota negativo"
			>
				<svg class="w-4 h-4 {userVote === -1 ? (argument.is_objection ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10 15l-5-5h10l-5 5z"/>
				</svg>
			</button>
		</div>
	</div>
	
	{#if !isExpanded && showConfirmations && confirmations.length > 0}
		<div class="compact-list confirmations-list mt-3 border-l-2 {argument.is_objection ? 'border-red-300' : 'border-green-300'} pl-3">
			<ul class="space-y-1">
				{#each confirmations.sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0)) as child}
					<li
						class="compact-list-item p-2 rounded hover:bg-gray-50 transition-all duration-300 cursor-pointer text-sm text-gray-700 leading-snug {highlightedChildId === child.id ? 'ring-2 ' + (argument.is_objection ? 'ring-red-500' : 'ring-green-500') : ''}"
						onclick={(e) => {
							e.stopPropagation();
							handleChildClick(child);
						}}
						onkeydown={(e) => e.key === 'Enter' && handleChildClick(child)}
						tabindex="0"
					>
						{child.argument}
					</li>
				{/each}
			</ul>
			{#if $auth.user}
				<button
					class="add-child-button mt-1 p-2 text-sm font-bold {argument.is_objection ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} underline cursor-pointer w-full text-left"
					onclick={(e) => {
						e.stopPropagation();
						toggleConfirmationForm();
					}}
				>
					+ Aggiungi conferma
				</button>
			{/if}
		</div>
	{/if}

	{#if !isExpanded && showObjections && objections.length > 0}
		<div class="compact-list objections-list mt-3 border-l-2 {argument.is_objection ? 'border-green-300' : 'border-red-300'} pl-3">
			<ul class="space-y-1">
				{#each objections.sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0)) as child}
					<li
						class="compact-list-item p-2 rounded hover:bg-gray-50 transition-all duration-300 cursor-pointer text-sm text-gray-700 leading-snug {highlightedChildId === child.id ? 'ring-2 ' + (argument.is_objection ? 'ring-green-500' : 'ring-red-500') : ''}"
						onclick={(e) => {
							e.stopPropagation();
							handleChildClick(child);
						}}
						onkeydown={(e) => e.key === 'Enter' && handleChildClick(child)}
						tabindex="0"
					>
						{child.argument}
					</li>
				{/each}
			</ul>
			{#if $auth.user}
				<button
					class="add-child-button mt-1 p-2 text-sm font-bold {argument.is_objection ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} underline cursor-pointer w-full text-left"
					onclick={(e) => {
						e.stopPropagation();
						toggleObjectionForm();
					}}
				>
					+ Aggiungi obiezione
				</button>
			{/if}
		</div>
	{/if}
		
	{#if isExpanded}
		<!-- Expanded view: 2-column grid if in expanded column or if this is an expanded child, vertical otherwise -->
		<div class="expanded-children mt-4 {inColumnExpanded || (depth > 0 && isExpanded) ? 'grid grid-cols-2 gap-6' : 'space-y-4'}">
			<!-- Conferme section -->
			<div class="children-section confirmations-section border-l-4 {argument.is_objection ? 'border-red-500' : 'border-green-500'} pl-4 {inColumnExpanded ? '' : 'mb-4'}">
				<div class="section-header flex items-center justify-between mb-2">
					<h4 class="section-title text-sm font-bold {argument.is_objection ? 'text-red-700' : 'text-green-700'}">Conferme</h4>
					{#if $auth.user}
						<button
							class="action-confirm text-sm font-bold cursor-pointer {argument.is_objection ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} underline transition-colors"
							onclick={(e) => {
								e.stopPropagation();
								toggleConfirmationForm();
							}}
						>
							Conferma
						</button>
					{/if}
				</div>
				
				{#if showConfirmationForm}
					<div class="form-container mb-3 p-3 {argument.is_objection ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} rounded border">
						<ArgumentForm
							{debateId}
							parentId={argument.id}
							isObjection={false}
							onClose={() => showConfirmationForm = false}
							onSuccess={async (newArg) => {
								if (!argument.children) argument.children = [];
								argument.children = [...argument.children, newArg];
								
								// Highlight the new argument
								setTimeout(() => {
									const element = document.getElementById(`argument-${newArg.id}`);
									if (element) {
										element.scrollIntoView({ behavior: 'smooth', block: 'center' });
										element.classList.add('highlight-new');
										setTimeout(() => element.classList.remove('highlight-new'), 2000);
									}
								}, 100);
							}}
						/>
					</div>
				{/if}
				
				<div class="children-list space-y-2">
					{#each confirmations.sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0)) as child (child.id)}
						<div animate:flip={{ duration: 300 }}>
							<svelte:self 
								argument={child} 
								{debateId} 
								depth={depth + 1} 
								{inColumnExpanded}
								isExpanded={expandedChildId === child.id}
								onExpand={handleChildExpand}
							/>
						</div>
					{/each}
					{#if confirmations.length === 0 && !showConfirmationForm}
						<p class="empty-message text-xs text-gray-500 italic">Nessuna conferma</p>
					{/if}
				</div>
			</div>
			
			<!-- Obiezioni section -->
			<div class="children-section objections-section border-l-4 {argument.is_objection ? 'border-green-500' : 'border-red-500'} pl-4">
				<div class="section-header flex items-center justify-between mb-2">
					<h4 class="section-title text-sm font-bold {argument.is_objection ? 'text-green-700' : 'text-red-700'}">Obiezioni</h4>
					{#if $auth.user}
						<button
							class="action-object text-sm font-bold cursor-pointer {argument.is_objection ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} underline transition-colors"
							onclick={(e) => {
								e.stopPropagation();
								toggleObjectionForm();
							}}
						>
							Obietta
						</button>
					{/if}
				</div>
				
				{#if showObjectionForm}
					<div class="form-container mb-3 p-3 {argument.is_objection ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded border">
						<ArgumentForm
							{debateId}
							parentId={argument.id}
							isObjection={true}
							onClose={() => showObjectionForm = false}
							onSuccess={async (newArg) => {
								if (!argument.children) argument.children = [];
								argument.children = [...argument.children, newArg];
								
								// Highlight the new argument
								setTimeout(() => {
									const element = document.getElementById(`argument-${newArg.id}`);
									if (element) {
										element.scrollIntoView({ behavior: 'smooth', block: 'center' });
										element.classList.add('highlight-new');
										setTimeout(() => element.classList.remove('highlight-new'), 2000);
									}
								}, 100);
							}}
						/>
					</div>
				{/if}
				
				<div class="children-list space-y-2">
					{#each objections.sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0)) as child (child.id)}
						<div animate:flip={{ duration: 300 }}>
							<svelte:self 
								argument={child} 
								{debateId} 
								depth={depth + 1} 
								{inColumnExpanded}
								isExpanded={expandedChildId === child.id}
								onExpand={handleChildExpand}
							/>
						</div>
					{/each}
					{#if objections.length === 0 && !showObjectionForm}
						<p class="empty-message text-xs text-gray-500 italic">Nessuna obiezione</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

{#if selectedSourceIndex !== null && sources[selectedSourceIndex]}
	<SourceModal
		source={sources[selectedSourceIndex]}
		onClose={() => selectedSourceIndex = null}
	/>
{/if}

<style>
	:global(.highlight-new) {
		box-shadow: 0 0 0 3px hsl(var(--primary));
		animation: highlight 2s ease-out;
	}

	@keyframes highlight {
		from {
			box-shadow: 0 0 0 3px hsl(var(--primary));
		}
		to {
			box-shadow: 0 0 0 0 hsl(var(--primary));
		}
	}
	
	/* Override shared.css gray color for action buttons */
	.argument-actions .action-confirm,
	.argument-actions .action-object,
	.add-child-button {
		/* color: inherit !important; */
	}
	
	/* Compact list styling */
	.compact-list-item {
		list-style: none;
	}
	
	/* Second-level expansion: make child arguments expand to cover sibling */
	.child-expanded {
		position: absolute;
		z-index: 20;
		width: calc(200% + 1.5rem);
		max-width: none;
	}
	
	/* Position confirmations (non-objections) on the left */
	.child-expanded-left {
		left: 0;
		right: auto;
	}
	
	/* Position objections on the right */
	.child-expanded-right {
		left: auto;
		right: 0;
	}
	
	/* Ensure parent container allows absolute positioning */
	.children-list {
		position: relative;
	}
</style>
