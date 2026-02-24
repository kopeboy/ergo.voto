import { writable } from 'svelte/store';
import { directus } from '$lib/directus';
import { authentication, login, logout, readMe } from '@directus/sdk';

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

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		error: null
	});

	return {
		subscribe,

		/**
		 * Inizializza l'autenticazione verificando se c'è un token salvato
		 */
		async init() {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				// Verifica se c'è un token salvato (Directus SDK lo gestisce automaticamente)
				const user = await directus.request(readMe());
				
				set({
					user: {
						id: user.id,
						email: user.email || '',
						first_name: user.first_name || undefined,
						last_name: user.last_name || undefined,
						role: user.role as string || undefined
					},
					loading: false,
					error: null
				});
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
				// Login con Directus SDK
				await directus.request(
					login({ email, password })
				);

				// Carica i dati dell'utente
				const user = await directus.request(readMe());

				set({
					user: {
						id: user.id,
						email: user.email || '',
						first_name: user.first_name || undefined,
						last_name: user.last_name || undefined,
						role: user.role as string || undefined
					},
					loading: false,
					error: null
				});

				return true;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Login fallito';
				set({ user: null, loading: false, error: errorMessage });
				return false;
			}
		},

		/**
		 * Logout
		 */
		async logout() {
			update(state => ({ ...state, loading: true, error: null }));

			try {
				await directus.request(logout());
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
