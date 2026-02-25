<script lang="ts">
	import { createDebate } from '$lib/api/debates';
	import RichTextEditor from './RichTextEditor.svelte';

	export let onSuccess: () => void;
	export let onCancel: () => void;

	let title = '';
	let question = '';
	let description = '';
	let loading = false;
	let error: string | null = null;

	const MIN_TITLE_LENGTH = 5;
	const MAX_TITLE_LENGTH = 200;
	const MIN_QUESTION_LENGTH = 10;
	const MAX_QUESTION_LENGTH = 500;
	const MAX_DESCRIPTION_LENGTH = 2000;

	$: titleLength = title.length;
	$: questionLength = question.length;
	$: descriptionLength = getTextLength(description);

	function getTextLength(html: string): number {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent?.length || 0;
	}
	$: isValid = 
		title.trim().length >= MIN_TITLE_LENGTH && 
		title.length <= MAX_TITLE_LENGTH &&
		question.trim().length >= MIN_QUESTION_LENGTH && 
		question.length <= MAX_QUESTION_LENGTH &&
		descriptionLength <= MAX_DESCRIPTION_LENGTH;

	async function handleSubmit() {
		if (!isValid) return;

		loading = true;
		error = null;

		try {
			const cleanDescription = description.trim();
			const isEmpty = cleanDescription === '' || cleanDescription === '<p></p>';
			
			await createDebate({
				title: title.trim(),
				question: question.trim(),
				description: isEmpty ? undefined : cleanDescription
			});

			// Reset form
			title = '';
			question = '';
			description = '';
			
			onSuccess();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Errore durante la creazione del dibattito';
		} finally {
			loading = false;
		}
	}
</script>

<div class="debate-form">
	<h3 class="form-title">Crea Nuovo Dibattito</h3>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700">Titolo</span>
				<span class="char-count" class:warning={titleLength > MAX_TITLE_LENGTH * 0.9}>
					{titleLength}/{MAX_TITLE_LENGTH}
				</span>
			</div>
			<input
				type="text"
				bind:value={title}
				placeholder="Es: Cambiamento Climatico"
				maxlength={MAX_TITLE_LENGTH}
				disabled={loading}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			{#if title.trim().length > 0 && title.trim().length < MIN_TITLE_LENGTH}
				<p class="validation-error">Minimo {MIN_TITLE_LENGTH} caratteri</p>
			{/if}
		</div>

		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700">Domanda del Dibattito</span>
				<span class="char-count" class:warning={questionLength > MAX_QUESTION_LENGTH * 0.9}>
					{questionLength}/{MAX_QUESTION_LENGTH}
				</span>
			</div>
			<textarea
				bind:value={question}
				placeholder="Es: Il cambiamento climatico è causato principalmente dall'attività umana?"
				rows="3"
				maxlength={MAX_QUESTION_LENGTH}
				disabled={loading}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
			></textarea>
			{#if question.trim().length > 0 && question.trim().length < MIN_QUESTION_LENGTH}
				<p class="validation-error">Minimo {MIN_QUESTION_LENGTH} caratteri</p>
			{/if}
		</div>

		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700">Descrizione (opzionale)</span>
			</div>
			<RichTextEditor
				bind:content={description}
				placeholder="Descrizione del contesto e obiettivi del dibattito..."
				maxLength={MAX_DESCRIPTION_LENGTH}
				disabled={loading}
			/>
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
				{loading ? 'Creazione...' : 'Crea Dibattito'}
			</button>
		</div>
	</form>
</div>

<style>
	.debate-form {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.form-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.form-group {
		margin-bottom: 1.5rem;
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

	.validation-error {
		color: #dc2626;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.btn-cancel {
		padding: 0.625rem 1.25rem;
		background: white;
		border: 1px solid #d1d5db;
		color: #374151;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.btn-cancel:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-submit {
		padding: 0.625rem 1.25rem;
		background: #3b82f6;
		border: none;
		color: white;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-submit:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-submit:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}
</style>
