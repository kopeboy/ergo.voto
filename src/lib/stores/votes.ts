import { writable, derived, get } from 'svelte/store';
import { SvelteMap } from 'svelte/reactivity';
import { directus } from '$lib/directus';
import { readItems, createItem, updateItem } from '@directus/sdk';
import type { VoteDimension } from '$lib/types';

interface UserVote {
	id: string;
	claim_id: string;
	accuracy: number;
	relevance: number;
}

// Store per i voti dell'utente corrente - usa SvelteMap per reattività
export const userVotesStore = writable<SvelteMap<string, UserVote>>(new SvelteMap());

/**
 * Carica i voti dell'utente per una lista specifica di claim IDs
 * (solo per le claim visibili sulla pagina corrente)
 */
export async function loadUserVotesForClaims(claimIds: string[]) {
	if (claimIds.length === 0) {
		userVotesStore.set(new SvelteMap());
		return;
	}

	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _in: claimIds.map(id => Number(id)) }
					// Directus filtra automaticamente per utente corrente
				},
				limit: -1
			})
		);

		const votesMap = new SvelteMap<string, UserVote>();
		votes.forEach((vote: any) => {
			votesMap.set(String(vote.claim_id), {
				id: String(vote.id),
				claim_id: String(vote.claim_id),
				accuracy: vote.accuracy || 0,
				relevance: vote.relevance || 0
			});
		});

		userVotesStore.set(votesMap);
	} catch (error) {
		console.error('Error loading user votes for claims:', error);
		userVotesStore.set(new SvelteMap());
	}
}

/**
 * Vota con cache locale - ZERO query extra!
 */
export async function voteWithCache(
	claimId: string,
	dimension: VoteDimension,
	value: number
): Promise<{ finalValue: number; delta: number }> {
	const currentVotes = get(userVotesStore);
	const existingVote = currentVotes.get(claimId);

	try {
		if (existingVote) {
			// Aggiorna voto esistente
			const currentValue = existingVote[dimension] || 0;
			
			// Toggle logic: se voti di nuovo nella stessa direzione, rimuovi il voto
			const finalValue = currentValue === value ? 0 : value;
			const delta = finalValue - currentValue;
			
			const updatedVote = {
				...existingVote,
				[dimension]: finalValue
			};

			// Aggiorna cache locale PRIMA della chiamata backend (ottimistico)
			// Con SvelteMap, possiamo modificare direttamente - è reattivo
			currentVotes.set(claimId, updatedVote);

			try {
				await directus.request(
					updateItem('votes', existingVote.id, {
						[dimension]: finalValue
					})
				);
			} catch (error) {
				// Rollback in caso di errore
				userVotesStore.set(currentVotes);
				throw error;
			}
			
			return { finalValue, delta };
		} else {
			// Crea nuovo voto
			const newVote = await directus.request(
				createItem('votes', {
					claim_id: Number(claimId),
					accuracy: dimension === 'accuracy' ? value : 0,
					relevance: dimension === 'relevance' ? value : 0
				})
			);

			// Aggiungi alla cache locale - SvelteMap è reattivo
			currentVotes.set(claimId, {
				id: String(newVote.id),
				claim_id: claimId,
				accuracy: newVote.accuracy || 0,
				relevance: newVote.relevance || 0
			});
			
			return { finalValue: value, delta: value };
		}
	} catch (error) {
		console.error('Error voting:', error);
		throw error;
	}
}

/**
 * Ottieni il voto dell'utente per una claim (dalla cache)
 */
export function getUserVoteFromCache(claimId: string): UserVote | null {
	const currentVotes = get(userVotesStore);
	return currentVotes.get(claimId) || null;
}

/**
 * Store derivato per controllare se l'utente ha votato
 */
export const hasVoted = derived(
	userVotesStore,
	$votes => (claimId: string) => $votes.has(claimId)
);

/**
 * Pulisci cache (al logout)
 */
export function clearVotesCache() {
	userVotesStore.set(new SvelteMap());
}
