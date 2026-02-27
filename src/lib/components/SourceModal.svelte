<script lang="ts">
	import type { Source } from '$lib/types';

	export let source: Source;
	export let onClose: () => void;

	function extractDomain(url: string): string {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		// Prevent closing on backdrop click
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
	<div class="bg-white border border-gray-200 rounded-lg max-w-2xl w-full p-6">
		<div class="flex justify-between items-start mb-4">
			<h3 class="text-lg font-semibold">Fonte</h3>
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

		<div class="space-y-4">
			<div>
				<a
					href={source.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-600 hover:underline break-all"
				>
					{source.url}
				</a>
				<p class="text-sm text-gray-600 mt-1">
					{extractDomain(source.url)}
				</p>
			</div>

			{#if source.quote}
				<div class="border-l-4 border-yellow-300 pl-4 py-2">
					<p class="text-sm italic">{source.quote}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
