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
): Promise<{ finalValue: number; delta: number }> {
	try {
		// 1. Cerca voto esistente dell'utente per questa claim
		// Nota: usiamo user_updated perché si popola automaticamente sia on create che on update
		const existingVotes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _eq: Number(claimId) },
					...(userId ? { user_updated: { _eq: userId } } : {})
				},
				limit: 1
			})
		);

		if (existingVotes.length > 0) {
			// 2. Aggiorna voto esistente
			const existingVote = existingVotes[0];
			if (!existingVote.id) throw new Error('Vote ID missing');
			
			const currentValue = existingVote[dimension] || 0;
			
			// Se l'utente vota di nuovo nella stessa direzione, rimuovi il voto (toggle)
			// Altrimenti, sostituisci con il nuovo voto
			const finalValue = currentValue === value ? 0 : value;
			const delta = finalValue - currentValue;
			
			// Aggiorna solo la dimensione votata, l'altra rimane invariata
			// user_updated viene gestito automaticamente da Directus
			await directus.request(
				updateItem('votes', existingVote.id, {
					[dimension]: finalValue
				})
			);
			
			return { finalValue, delta };
		} else {
			// 3. Crea nuovo voto
			await directus.request(
				createItem('votes', {
					claim_id: Number(claimId),
					accuracy: dimension === 'accuracy' ? value : 0,
					relevance: dimension === 'relevance' ? value : 0
				})
			);
			return { finalValue: value, delta: value };
		}
	} catch (error) {
		console.error('Error upserting vote:', error);
		throw error;
	}
}

/**
 * Ottieni i voti aggregati per una claim
 */
export async function getClaimVotes(claimId: string | number) {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _eq: Number(claimId) }
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
 * Ottieni i voti aggregati per multipli claims (più efficiente)
 */
export async function getMultipleClaimVotes(claimIds: (string | number)[]): Promise<Map<string, { accuracy: number; relevance: number }>> {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					claim_id: { _in: claimIds.map(Number) }
				}
			})
		);

		// Aggrega i voti per claim_id
		const votesByClaimId = new Map<string, { accuracy: number; relevance: number }>();
		
		votes.forEach(vote => {
			const claimId = String(vote.claim_id);
			const existing = votesByClaimId.get(claimId) || { accuracy: 0, relevance: 0 };
			
			votesByClaimId.set(claimId, {
				accuracy: existing.accuracy + (vote.accuracy || 0),
				relevance: existing.relevance + (vote.relevance || 0)
			});
		});

		return votesByClaimId;
	} catch (error) {
		console.error('Error getting multiple claim votes:', error);
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
