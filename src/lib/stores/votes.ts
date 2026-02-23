import { writable, derived, get } from 'svelte/store';
import { directus } from '$lib/directus';
import { readItems, createItem, updateItem } from '@directus/sdk';
import type { VoteDimension } from '$lib/types';

interface UserVote {
	id: string;
	claim_id: string;
	accuracy: number;
	relevance: number;
}

// Store per i voti dell'utente corrente
const userVotesStore = writable<Map<string, UserVote>>(new Map());

/**
 * Carica tutti i voti dell'utente corrente (chiamare al login)
 * Nota: usiamo user_updated perché si popola automaticamente sia on create che on update
 */
export async function loadUserVotes() {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					// Directus filtra automaticamente per utente corrente
				},
				limit: -1 // Tutti i voti dell'utente
			})
		);

		const votesMap = new Map<string, UserVote>();
		votes.forEach((vote: any) => {
			votesMap.set(vote.claim_id, {
				id: vote.id,
				claim_id: vote.claim_id,
				accuracy: vote.accuracy || 0,
				relevance: vote.relevance || 0
			});
		});

		userVotesStore.set(votesMap);
	} catch (error) {
		console.error('Error loading user votes:', error);
	}
}

/**
 * Vota con cache locale - ZERO query extra!
 */
export async function voteWithCache(
	claimId: string,
	dimension: VoteDimension,
	value: number
): Promise<void> {
	const currentVotes = get(userVotesStore);
	const existingVote = currentVotes.get(claimId);

	try {
		if (existingVote) {
			// Aggiorna voto esistente
			const updatedVote = {
				...existingVote,
				[dimension]: value
			};

			await directus.request(
				updateItem('votes', existingVote.id, {
					[dimension]: value
				})
			);

			// Aggiorna cache locale
			const newVotesMap = new Map(currentVotes);
			newVotesMap.set(claimId, updatedVote);
			userVotesStore.set(newVotesMap);
		} else {
			// Crea nuovo voto
			const newVote = await directus.request(
				createItem('votes', {
					claim_id: claimId,
					accuracy: dimension === 'accuracy' ? value : 0,
					relevance: dimension === 'relevance' ? value : 0
				})
			);

			// Aggiungi alla cache locale
			const newVotesMap = new Map(currentVotes);
			newVotesMap.set(claimId, {
				id: newVote.id,
				claim_id: claimId,
				accuracy: newVote.accuracy || 0,
				relevance: newVote.relevance || 0
			});
			userVotesStore.set(newVotesMap);
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
	userVotesStore.set(new Map());
}
