<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import AuthModal from './AuthModal.svelte';

	let showAuthModal = false;
	
	onMount(() => {
		auth.init();
	});

	function handleLogout() {
		auth.logout();
	}
</script>

<header class="site-header">
	<div class="header-content">
		<div class="header-left">
			<a href="/" class="logo">
				<span class="logo-icon">⚖️</span>
				<span class="logo-text">Ergo.voto</span>
			</a>
		</div>

		<nav class="header-nav">
			<a href="/" class="nav-link">Home</a>
			<a href="/debates" class="nav-link">Dibattiti</a>
		</nav>

		<div class="header-right">
			{#if $auth.loading}
				<div class="loading-indicator">...</div>
			{:else if $auth.user}
				<div class="user-menu">
					<span class="user-email">{$auth.user.email}</span>
					<button class="btn-logout" on:click={handleLogout}>
						Esci
					</button>
				</div>
			{:else}
				<button class="btn-login" on:click={() => showAuthModal = true}>
					Accedi
				</button>
			{/if}
		</div>
	</div>
</header>

<AuthModal isOpen={showAuthModal} onClose={() => showAuthModal = false} />

<style>
	.site-header {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.header-left {
		flex-shrink: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: 700;
		font-size: 1.25rem;
		color: #111827;
	}

	.logo:hover {
		color: #3b82f6;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.header-nav {
		display: flex;
		gap: 1.5rem;
		flex: 1;
	}

	.nav-link {
		color: #6b7280;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: #111827;
	}

	.header-right {
		flex-shrink: 0;
	}

	.loading-indicator {
		color: #6b7280;
		padding: 0.5rem 1rem;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-email {
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-login,
	.btn-logout {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-size: 0.875rem;
	}

	.btn-login {
		background: #3b82f6;
		color: white;
	}

	.btn-login:hover {
		background: #2563eb;
	}

	.btn-logout {
		background: white;
		color: #6b7280;
		border: 1px solid #d1d5db;
	}

	.btn-logout:hover {
		background: #f9fafb;
		color: #111827;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-wrap: wrap;
		}

		.header-nav {
			order: 3;
			width: 100%;
			justify-content: center;
			padding-top: 0.5rem;
			border-top: 1px solid #e5e7eb;
		}

		.user-email {
			display: none;
		}
	}
</style>
