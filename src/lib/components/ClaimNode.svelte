<script lang="ts">
	import type { Claim, VoteDimension } from '$lib/types';
	import { userVotesStore } from '$lib/stores/votes';
	import { auth } from '$lib/stores/auth';
	import ClaimForm from './ClaimForm.svelte';

	export let claim: Claim;
	export let depth: number = 0;
	export let onVote: (claimId: string, dimension: VoteDimension, value: number) => void;
	export let debateId: string;
	export let onClaimCreated: () => void;

	let showReplyForm = false;

	const handleVote = (dimension: VoteDimension, value: number) => {
		onVote(claim.id, dimension, value);
	};

	const getTypeColor = (type: string) => {
		if (type === 'pro') return 'border-green-500';
		if (type === 'contro') return 'border-red-500';
		if (type === 'fatto') return 'border-gray-400';
		return 'border-blue-400'; // neutro
	};

	const getTypeBg = (type: string) => {
		if (type === 'pro') return 'bg-green-50';
		if (type === 'contro') return 'bg-red-50';
		if (type === 'fatto') return 'bg-gray-50';
		return 'bg-blue-50'; // neutro
	};

	const getTypeBadgeColor = (type: string) => {
		if (type === 'pro') return 'bg-green-600';
		if (type === 'contro') return 'bg-red-600';
		if (type === 'fatto') return 'bg-gray-600';
		return 'bg-blue-600'; // neutro
	};

	const getTypeLabel = (type: string) => {
		if (type === 'pro') return 'PRO';
		if (type === 'contro') return 'CONTRO';
		if (type === 'fatto') return 'FATTO';
		return 'NEUTRO';
	};

	// Reactive: calcola lo stato dei voti per questo claim
	$: userVote = $userVotesStore.get(claim.id);
	$: accuracyUpvoted = userVote?.accuracy === 1;
	$: accuracyDownvoted = userVote?.accuracy === -1;
	$: relevanceUpvoted = userVote?.relevance === 1;
	$: relevanceDownvoted = userVote?.relevance === -1;
</script>

<div class="claim-container" style="margin-left: {depth * 24}px">
	{#if depth > 0}
		<div class="thread-line" style="left: {-12}px"></div>
	{/if}
	
	<div class="claim-card border-l-4 {getTypeColor(claim.type)} {getTypeBg(claim.type)} {claim.status === 'draft' ? 'opacity-70' : ''}">
		<div class="claim-header">
			<span class="claim-type-badge {getTypeBadgeColor(claim.type)}">
				{getTypeLabel(claim.type)}
			</span>
			{#if claim.is_ergo}
				<span class="ergo-badge">∴ ERGO</span>
			{/if}
			{#if claim.status === 'draft'}
				<span class="draft-badge">BOZZA</span>
			{/if}
			{#if claim.user_updated}
				<span class="claim-author">da {claim.user_updated.substring(0, 8)}...</span>
			{/if}
		</div>

		<div class="claim-content">
			{claim.content}
		</div>

		{#if claim.citations && claim.citations.length > 0}
			<div class="citations">
				<span class="citations-label">📎 Cita:</span>
				{#each claim.citations as citationId}
					<span class="citation-badge">{citationId.substring(0, 8)}...</span>
				{/each}
			</div>
		{/if}

		<div class="voting-section">
			<div class="vote-dimension">
				<span class="dimension-label">Accuratezza</span>
				<div class="vote-buttons">
					<button 
						class="vote-btn upvote {accuracyUpvoted ? 'voted' : ''}" 
						on:click={() => handleVote('accuracy', 1)}
						aria-label="Upvote accuracy"
					>
						▲
					</button>
					<span class="vote-count">{claim.votes.accuracy}</span>
					<button 
						class="vote-btn downvote {accuracyDownvoted ? 'voted' : ''}" 
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
						class="vote-btn upvote {relevanceUpvoted ? 'voted' : ''}" 
						on:click={() => handleVote('relevance', 1)}
						aria-label="Upvote relevance"
					>
						▲
					</button>
					<span class="vote-count">{claim.votes.relevance}</span>
					<button 
						class="vote-btn downvote {relevanceDownvoted ? 'voted' : ''}" 
						on:click={() => handleVote('relevance', -1)}
						aria-label="Downvote relevance"
					>
						▼
					</button>
				</div>
			</div>
		</div>

		<!-- Bottone Rispondi -->
		{#if $auth.user && !showReplyForm}
			<button class="btn-reply" on:click={() => showReplyForm = true}>
				↩️ Rispondi
			</button>
		{/if}
	</div>

	<!-- Form di risposta inline -->
	{#if showReplyForm}
		<div class="reply-form-container">
			<ClaimForm 
				{debateId}
				parentId={claim.id}
				claimType={claim.type === 'pro' ? 'contro' : claim.type === 'contro' ? 'pro' : 'fatto'}
				onSuccess={() => {
					showReplyForm = false;
					onClaimCreated();
				}}
				onCancel={() => showReplyForm = false}
			/>
		</div>
	{/if}

	{#if claim.children && claim.children.length > 0}
		<div class="children">
			{#each claim.children as child (child.id)}
				<svelte:self 
					claim={child} 
					depth={depth + 1} 
					{onVote}
					{debateId}
					{onClaimCreated}
				/>
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

	.claim-author {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.draft-badge {
		background: #fef3c7;
		color: #92400e;
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ergo-badge {
		background: #dbeafe;
		color: #1e40af;
		font-size: 0.625rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.citations {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.citations-label {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.citation-badge {
		background: #f3f4f6;
		color: #374151;
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		border: 1px solid #d1d5db;
		font-family: monospace;
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

	.vote-btn.upvote.voted {
		color: #10b981;
		font-weight: bold;
	}

	.vote-btn.downvote.voted {
		color: #dc2626;
		font-weight: bold;
	}

	.vote-count {
		font-weight: 600;
		min-width: 2rem;
		text-align: center;
		color: #374151;
	}

	.btn-reply {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		color: #374151;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 0.75rem;
	}

	.btn-reply:hover {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	.reply-form-container {
		margin-top: 1rem;
		margin-left: 1rem;
		padding-left: 1rem;
		border-left: 2px solid #e5e7eb;
	}

	.children {
		margin-top: 0.5rem;
	}
</style>
