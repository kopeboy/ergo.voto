<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import '../../routes/shared.css';

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
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={onClose} on:keydown={handleKeydown} role="presentation">
		<div class="modal-content" on:click|stopPropagation on:keydown={handleKeydown} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
			<div class="modal-header">
				<h2 id="modal-title">Accedi</h2>
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
	.form-actions .btn-primary,
	.form-actions .btn-secondary {
		flex: 1;
	}
</style>
