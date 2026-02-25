import { writable } from 'svelte/store';
import { directus } from '$lib/directus';
import { readMe } from '@directus/sdk';

interface User {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	role?: string;
}

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

// Intervallo di refresh: 14.5 minuti (token scade dopo 15, margine di 30 secondi)
const REFRESH_INTERVAL = 14.5 * 60 * 1000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		error: null
	});

	/**
	 * Avvia il timer per il refresh automatico del token
	 */
	function startRefreshTimer() {
		// Cancella timer esistente se presente
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}

		// Refresh automatico ogni 10 minuti
		refreshTimer = setInterval(async () => {
			try {
				await directus.refresh();
			} catch (error) {
				// Se il refresh fallisce, probabilmente il refresh token è scaduto
				// L'utente dovrà rifare login
				if (refreshTimer) {
					clearInterval(refreshTimer);
					refreshTimer = null;
				}
				set({ user: null, loading: false, error: 'Sessione scaduta' });
			}
		}, REFRESH_INTERVAL);
	}

	/**
	 * Ferma il timer di refresh
	 */
	function stopRefreshTimer() {
		if (refreshTimer) {
			clearInterval(refreshTimer);
			refreshTimer = null;
		}
	}

	return {
		subscribe,

		/**
		 * Inizializza l'autenticazione verificando se c'è un token salvato
		 */
		async init() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				// Verifica se c'è un token salvato
				const user = await directus.request(readMe({
					fields: ['id', 'email', 'first_name', 'last_name', 'role', 'role.id', 'role.name'] as any
				}));
				const roleName = typeof user.role === 'object' ? (user.role as any)?.name : undefined;
				
				set({
					user: {
						id: user.id,
						email: user.email || '',
						first_name: user.first_name || undefined,
						last_name: user.last_name || undefined,
						role: roleName
					},
					loading: false,
					error: null
				});

				// Avvia refresh automatico
				startRefreshTimer();
			} catch (error) {
				// Nessun token valido o utente non autenticato
				set({ user: null, loading: false, error: null });
			}
		},

		/**
		 * Login con email e password
		 */
		async login(email: string, password: string) {
			update(state => ({ ...state, loading: true, error: null }));

			try {
				// Login usando il metodo diretto del client (json mode con storage custom)
				await directus.login({ email, password });

				// Carica i dati dell'utente
				const user = await directus.request(readMe({
					fields: ['id', 'email', 'first_name', 'last_name', 'role', 'role.id', 'role.name'] as any
				}));
				const roleName = typeof user.role === 'object' ? (user.role as any)?.name : undefined;

				set({
					user: {
						id: user.id,
						email: user.email || '',
						first_name: user.first_name || undefined,
						last_name: user.last_name || undefined,
						role: roleName
					},
					loading: false,
					error: null
				});

				// Avvia refresh automatico
				startRefreshTimer();

				return true;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Email o password non corretti';
				set({ user: null, loading: false, error: errorMessage });
				return false;
			}
		},

		/**
		 * Logout
		 */
		async logout() {
			update(state => ({ ...state, loading: true, error: null }));

			// Ferma il refresh automatico
			stopRefreshTimer();

			try {
				await directus.logout();
				set({ user: null, loading: false, error: null });
			} catch (error) {
				// Anche se il logout fallisce, rimuoviamo l'utente localmente
				set({ user: null, loading: false, error: null });
			}
		},

		/**
		 * Pulisce gli errori
		 */
		clearError() {
			update(state => ({ ...state, error: null }));
		}
	};
}

export const auth = createAuthStore();
