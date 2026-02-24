<script lang="ts">
	import { auth } from '$lib/stores/auth';

	export let isOpen = false;
	export let onClose: () => void;

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin() {
		if (!email || !password) {
			error = 'Inserisci email e password';
			return;
		}

		loading = true;
		error = '';

		const success = await auth.login(email, password);

		if (success) {
			email = '';
			password = '';
			onClose();
		} else {
			error = 'Email o password non corretti';
		}

		loading = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin();
		} else if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={onClose} on:keydown={handleKeydown} role="presentation">
		<div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Accedi</h2>
				<button class="close-button" on:click={onClose} aria-label="Chiudi">×</button>
			</div>

			<form on:submit|preventDefault={handleLogin}>
				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="tuo@email.com"
						disabled={loading}
						required
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						disabled={loading}
						required
					/>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				<div class="form-actions">
					<button type="button" class="btn-secondary" on:click={onClose} disabled={loading}>
						Annulla
					</button>
					<button type="submit" class="btn-primary" disabled={loading}>
						{loading ? 'Accesso...' : 'Accedi'}
					</button>
				</div>
			</form>

			<div class="form-footer">
				<p class="text-sm">
					Non hai un account? Contatta l'amministratore per la registrazione.
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
	}

	.close-button:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-group input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-group input:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.625rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-size: 1rem;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		background: #93c5fd;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f9fafb;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-footer {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.text-sm {
		font-size: 0.875rem;
		color: #6b7280;
		text-align: center;
		margin: 0;
	}
</style>
