<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { getRootArguments } from '$lib/api/arguments';
	import { getDebate } from '$lib/api/debates';
	import DebateLayout from '$lib/components/DebateLayout.svelte';
	import type { Argument, Debate } from '$lib/types';
	import { auth } from '$lib/stores/auth';
	import { debateStore } from '$lib/stores/debate';

	let debateId = Number($page.params.id);
	let argumentsList: Argument[] = [];
	let debate: Debate | null = null;
	let loading = true;
	let error: string | null = null;

	async function loadDebate() {
		try {
			loading = true;
			
			const [debateData, args] = await Promise.all([
				getDebate(debateId),
				getRootArguments(debateId)
			]);
			
			debate = debateData;
			debateStore.set(debateData);
			argumentsList = args;
			error = null;
		} catch (err) {
			error = 'Errore nel caricamento del dibattito';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		document.body.classList.add('debate-page');
		loadDebate();
	});
	
	onDestroy(() => {
		document.body.classList.remove('debate-page');
		debateStore.set(null);
	});
</script>

<svelte:head>
	<title>{debate?.topic || `Dibattito #${debateId}`} - Ergo.voto</title>
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
		{argumentsList}
	/>

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
</style>
