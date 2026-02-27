<script lang="ts">
	import { createDebate } from '$lib/api/debates';
	import RichTextEditor from './RichTextEditor.svelte';

	export let onSuccess: () => void;
	export let onCancel: () => void;

	let topic = '';
	let type: 'claim' | 'question' = 'claim';
	let intro = '';
	let question = '';
	let claim = '';
	let loading = false;
	let error: string | null = null;

	const MIN_TOPIC_LENGTH = 5;
	const MAX_TOPIC_LENGTH = 200;
	const MIN_QUESTION_LENGTH = 10;
	const MAX_QUESTION_LENGTH = 500;
	const MIN_CLAIM_LENGTH = 10;
	const MAX_CLAIM_LENGTH = 500;
	const MAX_INTRO_LENGTH = 2000;

	$: topicLength = topic.length;
	$: questionLength = question.length;
	$: claimLength = claim.length;
	$: introLength = intro.length;

	$: isValid = 
		topic.trim().length >= MIN_TOPIC_LENGTH && 
		topic.length <= MAX_TOPIC_LENGTH &&
		(type === 'question' 
			? question.trim().length >= MIN_QUESTION_LENGTH && question.length <= MAX_QUESTION_LENGTH
			: claim.trim().length >= MIN_CLAIM_LENGTH && claim.length <= MAX_CLAIM_LENGTH) &&
		intro.length <= MAX_INTRO_LENGTH;

	async function handleSubmit() {
		if (!isValid) return;

		loading = true;
		error = null;

		try {
			await createDebate({
				topic: topic.trim(),
				type,
				intro: intro.trim() || undefined,
				question: type === 'question' ? question.trim() : undefined,
				claim: type === 'claim' ? claim.trim() : undefined
			});

			// Reset form
			topic = '';
			type = 'claim';
			intro = '';
			question = '';
			claim = '';
			
			onSuccess();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Errore durante la creazione del dibattito';
		} finally {
			loading = false;
		}
	}
</script>

<div class="debate-form">
	<h3 class="form-title">Crea nuovo dibattito</h3>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700">Argomento</span>
				<span class="char-count" class:warning={topicLength > MAX_TOPIC_LENGTH * 0.9}>
					{topicLength}/{MAX_TOPIC_LENGTH}
				</span>
			</div>
			<input
				type="text"
				bind:value={topic}
				placeholder="Es: Cambiamento Climatico"
				maxlength={MAX_TOPIC_LENGTH}
				disabled={loading}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			{#if topic.trim().length > 0 && topic.trim().length < MIN_TOPIC_LENGTH}
				<p class="validation-error">minimo {MIN_TOPIC_LENGTH} caratteri</p>
			{/if}
		</div>

		<div class="form-group">
			<label for="debate-type" class="text-sm font-medium text-gray-900 mb-2 block text-left">Tipo</label>
			<select id="debate-type" bind:value={type} class="w-full px-3 py-2 border border-gray-300 rounded-md">
				<option value="claim">Tesi</option>
				<option value="question">Domanda</option>
			</select>
		</div>

		{#if type === 'question'}
			<div class="form-group">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium text-gray-700">Domanda</span>
					<span class="char-count" class:warning={questionLength > MAX_QUESTION_LENGTH * 0.9}>
						{questionLength}/{MAX_QUESTION_LENGTH}
					</span>
				</div>
				<input
					type="text"
					bind:value={question}
					placeholder="Es: Il cambiamento climatico è causato dall'uomo?"
					maxlength={MAX_QUESTION_LENGTH}
					disabled={loading}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
				/>
				{#if question.trim().length > 0 && question.trim().length < MIN_QUESTION_LENGTH}
					<p class="validation-error">Minimo {MIN_QUESTION_LENGTH} caratteri</p>
				{/if}
			</div>
		{:else}
			<div class="form-group">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium text-gray-700">Tesi</span>
					<span class="char-count" class:warning={claimLength > MAX_CLAIM_LENGTH * 0.9}>
						{claimLength}/{MAX_CLAIM_LENGTH}
					</span>
				</div>
				<input
					type="text"
					bind:value={claim}
					placeholder="Es: Il cambiamento climatico è causato principalmente dall'attività umana"
					maxlength={MAX_CLAIM_LENGTH}
					disabled={loading}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
				/>
				{#if claim.trim().length > 0 && claim.trim().length < MIN_CLAIM_LENGTH}
					<p class="validation-error">Minimo {MIN_CLAIM_LENGTH} caratteri</p>
				{/if}
			</div>
		{/if}

		<div class="form-group">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm font-medium text-gray-700">Introduzione (opzionale)</span>
				<span class="char-count" class:warning={introLength > MAX_INTRO_LENGTH * 0.9}>
					{introLength}/{MAX_INTRO_LENGTH}
				</span>
			</div>
			<textarea
				bind:value={intro}
				placeholder="Aggiungi contesto o dettagli sul dibattito..."
				rows="4"
				maxlength={MAX_INTRO_LENGTH}
				class="w-full px-3 py-2 border border-gray-300 rounded-md"
				disabled={loading}
			></textarea>
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
				{loading ? 'Creazione...' : 'Crea dibattito'}
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
		background: hsl(var(--primary));
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
