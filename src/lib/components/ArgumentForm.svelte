<script lang="ts">
	import { createArgument, createSource } from '$lib/api';
	import { toast } from '$lib/stores/toast';

	export let debateId: number;
	export let parentId: number | null;
	export let isObjection: boolean;
	export let onClose: () => void;
	export let onSuccess: (newArgument: any) => Promise<void> = async () => {};

	let argument = '';
	let sourceUrl = '';
	let sourceQuote = '';
	let sources: Array<{ url: string; quote?: string }> = [];
	let submitting = false;

	function addSource() {
		if (sourceUrl.trim()) {
			sources = [...sources, { url: sourceUrl.trim(), quote: sourceQuote.trim() || undefined }];
			sourceUrl = '';
			sourceQuote = '';
		}
	}

	function removeSource(index: number) {
		sources = sources.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		if (!argument.trim()) {
			toast.show('Inserisci il testo dell\'argomentazione', 'error');
			return;
		}

		submitting = true;
		try {
			const newArgument = await createArgument({
				debate: debateId,
				argument: argument.trim(),
				parent: parentId,
				is_objection: isObjection
			});

			for (const source of sources) {
				await createSource({
					argument_id: newArgument.id,
					url: source.url,
					quote: source.quote || undefined
				});
			}

			toast.show('Argomentazione pubblicata con successo!', 'success');
			await onSuccess(newArgument);
			onClose();
		} catch (error) {
			console.error('Error creating argument:', error);
			toast.show('Errore durante la creazione dell\'argomentazione', 'error');
			submitting = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		// Prevent closing on backdrop click to avoid accidental page reload
		e.stopPropagation();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div 
	class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
	onclick={handleBackdropClick}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div class="bg-white border border-gray-200 rounded-lg max-w-2xl w-full p-6" onclick={(e) => e.stopPropagation()}>
		<div class="flex justify-between items-start mb-4">
			<h3 class="text-lg font-semibold">
				{isObjection ? 'Nuova Obiezione' : 'Nuova Conferma'}
			</h3>
			<button
				class="text-gray-500 hover:text-gray-900 cursor-pointer"
				onclick={onClose}
				aria-label="Chiudi"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4 text-left">
			<div>
				<label for="argument" class="block text-sm font-medium mb-2 text-left text-gray-900">
					Argomentazione
				</label>
				<textarea
					id="argument"
					bind:value={argument}
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
					placeholder="Scrivi il tuo argomento..."
					required
				></textarea>
			</div>

			<div class="space-y-3">
				<label class="block text-sm font-medium text-left text-gray-900">Fonti (opzionale)</label>
				
				{#if sources.length > 0}
					<div class="space-y-2">
						{#each sources as source, i}
							<div class="flex items-start gap-2 p-2 bg-gray-100 rounded">
								<div class="flex-1 text-sm">
									<div class="font-medium break-all">{source.url}</div>
									{#if source.quote}
										<div class="text-gray-600 mt-1">{source.quote}</div>
									{/if}
								</div>
								<button
									type="button"
									onclick={() => removeSource(i)}
									class="text-red-600 hover:text-red-700 cursor-pointer"
									aria-label="Rimuovi fonte"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<div class="space-y-2">
					<input
						type="url"
						bind:value={sourceUrl}
						placeholder="URL della fonte"
						class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
					/>
					<textarea
						bind:value={sourceQuote}
						rows="2"
						placeholder="Citazione (opzionale)"
						class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
					></textarea>
					<button
						type="button"
						class="px-3 py-1.5 text-sm rounded-md font-medium cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
						onclick={addSource}
					>
						Aggiungi Fonte
					</button>
				</div>
			</div>

			<div class="flex justify-end gap-2 pt-4">
				<button
					type="button"
					class="px-4 py-2 text-sm rounded-md font-medium cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
					onclick={onClose}
				>
					Annulla
				</button>
				<button
					type="submit"
					disabled={!argument.trim() || submitting}
					class="px-4 py-2 text-sm rounded-md font-semibold cursor-pointer bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					style="color: white;"
				>
					{submitting ? 'Pubblicazione...' : 'Pubblica'}
				</button>
			</div>
		</form>
	</div>
</div>
