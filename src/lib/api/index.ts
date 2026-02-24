import { getRootClaims } from './claims';
import { getMultipleClaimVotes } from './votes';
import type { Claim } from '$lib/types';

/**
 * Carica l'intero albero dei claims con i voti aggregati per un debate specifico
 * Questa è la funzione principale da usare nella pagina dibattito
 */
export async function getDebateTree(debateId: string | number): Promise<Claim[]> {
	try {
		// 1. Carica tutti i claims root con i loro figli
		const claims = await getRootClaims(debateId);

		// 2. Estrai tutti gli ID dei claims (inclusi i figli ricorsivamente)
		const allClaimIds = extractAllClaimIds(claims);

		// 3. Carica tutti i voti in una singola query (più efficiente)
		const votesMap = await getMultipleClaimVotes(allClaimIds);

		// 4. Popola i voti nei claims ricorsivamente
		const claimsWithVotes = populateVotes(claims, votesMap);

		return claimsWithVotes;
	} catch (error) {
		console.error('Error loading debate tree:', error);
		throw error;
	}
}

/**
 * Estrae tutti gli ID dei claims ricorsivamente
 */
function extractAllClaimIds(claims: Claim[]): string[] {
	const ids: string[] = [];
	
	function extract(claim: Claim) {
		ids.push(claim.id);
		if (claim.children) {
			claim.children.forEach(extract);
		}
	}
	
	claims.forEach(extract);
	return ids;
}

/**
 * Popola i voti nei claims ricorsivamente
 */
function populateVotes(
	claims: Claim[],
	votesMap: Map<string, { accuracy: number; relevance: number }>
): Claim[] {
	return claims.map(claim => {
		const votes = votesMap.get(claim.id) || { accuracy: 0, relevance: 0 };
		
		return {
			...claim,
			votes,
			children: claim.children ? populateVotes(claim.children, votesMap) : []
		};
	});
}

// Re-export delle funzioni utili
export { getRootClaims, getClaimTree } from './claims';
export { upsertVote, getClaimVotes, getUserVote } from './votes';
export { voteWithCache, loadUserVotesForClaims, clearVotesCache } from '$lib/stores/votes';
