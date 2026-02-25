<script lang="ts">
	import { createClaim } from '$lib/api/claims';
	import type { ClaimType } from '$lib/types';
	import { auth } from '$lib/stores/auth';

	export let debateId: string;
	export let parentId: string | null = null;
	export let claimType: ClaimType = 'fatto'; // Tipo determinato dal bottone cliccato
	export let onSuccess: () => void;
	export let onCancel: () => void;

	let content = '';
	let loading = false;
	let error: string | null = null;
	let selectedCitations: string[] = [];
	let isErgo = false;

	const MIN_CONTENT_LENGTH = 10;
	const MAX_CONTENT_LENGTH = 500;

	$: contentLength = content.length;
	$: isValid = content.trim().length >= MIN_CONTENT_LENGTH && content.length <= MAX_CONTENT_LENGTH;

	async function handleSubmit() {
		if (!isValid) return;
		if (!$auth.user) {
			error = 'Devi essere autenticato per creare una claim';
			return;
		}

		loading = true;
		error = null;

		try {
			await createClaim({
				debate_id: Number(debateId),
				content: content.trim(),
				type: claimType,
				parent_id: parentId ? Number(parentId) : null,
				citations: selectedCitations.length > 0 ? selectedCitations : undefined,
				is_ergo: isErgo
			} as any);

			// Reset form
			content = '';
			selectedCitations = [];
			isErgo = false;
			
			onSuccess();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Errore durante la creazione della claim';
		} finally {
			loading = false;
		}
	}
</script>

<div class="claim-form">
	<h3 class="form-title">
		{#if parentId}
			Rispondi a questa argomentazione
		{:else}
			Rispondi alla domanda del dibattito
		{/if}
	</h3>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="char-count" class:warning={contentLength > MAX_CONTENT_LENGTH * 0.9}>
					{contentLength}/{MAX_CONTENT_LENGTH}
				</span>
			</div>
			<textarea
				id="content"
				bind:value={content}
				placeholder="Scrivi la tua argomentazione..."
				rows="6"
				maxlength={MAX_CONTENT_LENGTH}
				disabled={loading}
				required
				class="text-base"
			></textarea>
			{#if content.trim().length > 0 && content.trim().length < MIN_CONTENT_LENGTH}
				<p class="validation-error">Minimo {MIN_CONTENT_LENGTH} caratteri</p>
			{/if}
		</div>

		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}

		<div class="form-actions">
			<button type="button" class="btn-cancel" on:click={onCancel} disabled={loading}>
				Annulla
			</button>
			<button type="submit" class="btn-submit" disabled={!isValid || loading}>
				{#if loading}
					Invio...
				{:else}
					Invia Argomentazione
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
	.claim-form {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1rem 0;
	}

	.form-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.char-count {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: normal;
	}

	.char-count.warning {
		color: #f59e0b;
		font-weight: 600;
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		min-height: 150px;
		transition: border-color 0.2s;
		line-height: 1.5;
	}

	textarea:hover:not(:disabled) {
		border-color: #9ca3af;
	}

	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	textarea:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	.validation-error {
		color: #ef4444;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	button {
		padding: 0.625rem 1.25rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-cancel {
		background: white;
		color: #6b7280;
		border: 1px solid #d1d5db;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.btn-submit {
		background: #3b82f6;
		color: white;
	}

	.btn-submit:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-submit:disabled {
		background: #93c5fd;
	}
</style>
