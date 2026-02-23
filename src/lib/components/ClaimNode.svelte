<script lang="ts">
	import type { Claim, VoteDimension } from '$lib/types';

	export let claim: Claim;
	export let depth: number = 0;
	export let onVote: (claimId: string, dimension: VoteDimension, value: number) => void;

	const handleVote = (dimension: VoteDimension, value: number) => {
		onVote(claim.id, dimension, value);
	};

	const getTypeColor = (type: string) => {
		return type === 'pro' ? 'border-green-500' : 'border-red-500';
	};

	const getTypeBg = (type: string) => {
		return type === 'pro' ? 'bg-green-50' : 'bg-red-50';
	};
</script>

<div class="claim-container" style="margin-left: {depth * 24}px">
	{#if depth > 0}
		<div class="thread-line" style="left: {-12}px"></div>
	{/if}
	
	<div class="claim-card border-l-4 {getTypeColor(claim.type)} {getTypeBg(claim.type)}">
		<div class="claim-header">
			<span class="claim-type-badge {claim.type === 'pro' ? 'bg-green-600' : 'bg-red-600'}">
				{claim.type === 'pro' ? 'PRO' : 'CONTRO'}
			</span>
			{#if claim.user_updated}
				<span class="claim-author">da {claim.user_updated.substring(0, 8)}...</span>
			{/if}
		</div>

		<div class="claim-content">
			{claim.content}
		</div>

		<div class="voting-section">
			<div class="vote-dimension">
				<span class="dimension-label">Accuratezza</span>
				<div class="vote-buttons">
					<button 
						class="vote-btn upvote" 
						on:click={() => handleVote('accuracy', 1)}
						aria-label="Upvote accuracy"
					>
						▲
					</button>
					<span class="vote-count">{claim.votes.accuracy}</span>
					<button 
						class="vote-btn downvote" 
						on:click={() => handleVote('accuracy', -1)}
						aria-label="Downvote accuracy"
					>
						▼
					</button>
				</div>
			</div>

			<div class="vote-dimension">
				<span class="dimension-label">Rilevanza</span>
				<div class="vote-buttons">
					<button 
						class="vote-btn upvote" 
						on:click={() => handleVote('relevance', 1)}
						aria-label="Upvote relevance"
					>
						▲
					</button>
					<span class="vote-count">{claim.votes.relevance}</span>
					<button 
						class="vote-btn downvote" 
						on:click={() => handleVote('relevance', -1)}
						aria-label="Downvote relevance"
					>
						▼
					</button>
				</div>
			</div>

		</div>
	</div>

	{#if claim.children && claim.children.length > 0}
		<div class="children">
			{#each claim.children as child (child.id)}
				<svelte:self claim={child} depth={depth + 1} {onVote} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.claim-container {
		position: relative;
		margin-bottom: 1rem;
	}

	.thread-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: #e5e7eb;
	}

	.claim-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s;
	}

	.claim-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.claim-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.claim-type-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.claim-content {
		margin-bottom: 1rem;
		line-height: 1.6;
		color: #1f2937;
	}

	.voting-section {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.vote-dimension {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.dimension-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
	}

	.vote-buttons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.vote-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		padding: 0.25rem;
		color: #9ca3af;
		transition: color 0.2s;
	}

	.vote-btn:hover {
		color: #4b5563;
	}

	.vote-btn.upvote:hover {
		color: #10b981;
	}

	.vote-btn.downvote:hover {
		color: #ef4444;
	}

	.vote-count {
		font-weight: 600;
		min-width: 2rem;
		text-align: center;
		color: #374151;
	}

	.children {
		margin-top: 0.5rem;
	}
</style>
