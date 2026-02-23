import { directus } from '$lib/directus';
import { readItems, createItem, updateItem } from '@directus/sdk';
import type { VoteDimension } from '$lib/types';

/**
 * Vota su una claim con logica upsert (versione base).
 * 
 * ⚠️ PERFORMANCE: Questa versione fa 1 query SELECT prima di ogni voto.
 * Per migliori performance, usa `voteWithCache()` da `$lib/stores/votes.ts`
 * che carica tutti i voti dell'utente una volta sola all'inizio.
 * 
 * @param claimId - ID della claim
 * @param dimension - Dimensione del voto (accuracy o relevance)
 * @param value - Valore del voto (+1 o -1)
 * @param userId - ID dell'utente autenticato (opzionale, usa $CURRENT_USER se non fornito)
 */
export async function upsertVote(
	claimId: string,
	dimension: VoteDimension,
	value: number,
	userId?: string
): Promise<void> {
	try {
		// 1. Cerca voto esistente dell'utente per questa claim
		const existingVotes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _eq: claimId },
					...(userId ? { user_updated: { _eq: userId } } : {})
				},
				limit: 1
			})
		);

		if (existingVotes.length > 0) {
			// 2. Aggiorna voto esistente
			const existingVote = existingVotes[0];
			await directus.request(
				updateItem('votes', existingVote.id, {
					[dimension]: value,
					// Gli altri campi rimangono invariati
					...(dimension === 'accuracy' 
						? { relevance: existingVote.relevance } 
						: { accuracy: existingVote.accuracy })
				})
			);
		} else {
			// 3. Crea nuovo voto
			await directus.request(
				createItem('votes', {
					claim_id: claimId,
					accuracy: dimension === 'accuracy' ? value : 0,
					relevance: dimension === 'relevance' ? value : 0
				})
			);
		}
	} catch (error) {
		console.error('Error upserting vote:', error);
		throw error;
	}
}

/**
 * Ottieni i voti aggregati per una claim
 */
export async function getClaimVotes(claimId: string) {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _eq: claimId }
				}
			})
		);

		// Aggrega i voti
		const aggregated = votes.reduce(
			(acc, vote) => ({
				accuracy: acc.accuracy + (vote.accuracy || 0),
				relevance: acc.relevance + (vote.relevance || 0)
			}),
			{ accuracy: 0, relevance: 0 }
		);

		return aggregated;
	} catch (error) {
		console.error('Error getting claim votes:', error);
		throw error;
	}
}

/**
 * Ottieni il voto dell'utente corrente per una claim
 */
export async function getUserVote(claimId: string, userId?: string) {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _eq: claimId },
					...(userId ? { user_updated: { _eq: userId } } : {})
				},
				limit: 1
			})
		);

		return votes.length > 0 ? votes[0] : null;
	} catch (error) {
		console.error('Error getting user vote:', error);
		return null;
	}
}
