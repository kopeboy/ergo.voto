<script lang="ts">
	export let content: string;
</script>

<div class="rich-text-display">
	{@html content}
</div>

<style>
	.rich-text-display {
		color: #374151;
		line-height: 1.6;
	}

	:global(.rich-text-display p) {
		margin: 0.5rem 0;
	}

	:global(.rich-text-display p:first-child) {
		margin-top: 0;
	}

	:global(.rich-text-display p:last-child) {
		margin-bottom: 0;
	}

	:global(.rich-text-display strong) {
		font-weight: 600;
		color: #1f2937;
	}

	:global(.rich-text-display em) {
		font-style: italic;
	}

	:global(.rich-text-display a) {
		color: #2563eb;
		text-decoration: underline;
		transition: color 0.15s;
	}

	:global(.rich-text-display a:hover) {
		color: #1e40af;
	}

	:global(.rich-text-display ul, .rich-text-display ol) {
		margin: 0.75rem 0;
		padding-left: 1.5rem;
	}

	:global(.rich-text-display li) {
		margin: 0.25rem 0;
	}

	:global(.rich-text-display ul) {
		list-style-type: disc;
	}

	:global(.rich-text-display ol) {
		list-style-type: decimal;
	}

	:global(.rich-text-display h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem 0;
		color: #1f2937;
	}

	:global(.rich-text-display h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0.75rem 0 0.5rem 0;
		color: #1f2937;
	}
</style>
