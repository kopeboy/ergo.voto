import { directus } from '$lib/directus';
import { readItems, createItem } from '@directus/sdk';
import type { Claim } from '$lib/types';
import type { components } from '$lib/generated-types';

type DirectusClaim = components['schemas']['ItemsClaims'];

/**
 * Carica tutti i claims pubblicati da Directus per un debate specifico
 */
export async function getClaims(debateId: string | number): Promise<Claim[]> {
	try {
		const claims = await directus.request(
			readItems('claims', {
				filter: {
					debate_id: { _eq: Number(debateId) },
					status: { _eq: 'published' }
				},
				sort: ['date_updated'],
				limit: -1
			})
		);

		return claims.map(mapDirectusClaimToFrontend);
	} catch (error) {
		console.error('Error loading claims:', error);
		throw error;
	}
}

/**
 * Carica un singolo claim con i suoi figli (ricorsivo)
 */
export async function getClaimTree(claimId: string | number, debateId: string | number): Promise<Claim | null> {
	try {
		const claim = await directus.request(
			readItems('claims', {
				filter: {
					id: { _eq: Number(claimId) },
					debate_id: { _eq: Number(debateId) },
					status: { _eq: 'published' }
				},
				limit: 1
			})
		);

		if (!claim || claim.length === 0) return null;

		const mappedClaim = mapDirectusClaimToFrontend(claim[0]);
		
		// Carica i figli ricorsivamente
		const children = await getClaimChildren(Number(claimId), Number(debateId));
		mappedClaim.children = children;

		return mappedClaim;
	} catch (error) {
		console.error('Error loading claim tree:', error);
		throw error;
	}
}

/**
 * Carica i figli di un claim
 */
async function getClaimChildren(parentId: number, debateId: number): Promise<Claim[]> {
	try {
		const children = await directus.request(
			readItems('claims', {
				filter: {
					parent_id: { _eq: parentId },
					debate_id: { _eq: debateId },
					status: { _eq: 'published' }
				},
				sort: ['date_updated']
			})
		);

		// Carica ricorsivamente i figli di ogni figlio
		const mappedChildren = await Promise.all(
			children.map(async (child) => {
				const mapped = mapDirectusClaimToFrontend(child);
				if (child.id) {
					mapped.children = await getClaimChildren(child.id, debateId);
				}
				return mapped;
			})
		);

		return mappedChildren;
	} catch (error) {
		console.error('Error loading claim children:', error);
		return [];
	}
}

/**
 * Carica i claims root (senza parent) per un dibattito specifico
 */
export async function getRootClaims(debateId: string | number): Promise<Claim[]> {
	try {
		const claims = await directus.request(
			readItems('claims', {
				filter: {
					debate_id: { _eq: Number(debateId) },
					parent_id: { _null: true },
					status: { _eq: 'published' }
				},
				sort: ['date_updated']
			})
		);

		// Carica ricorsivamente i figli di ogni claim root
		const mappedClaims = await Promise.all(
			claims.map(async (claim) => {
				const mapped = mapDirectusClaimToFrontend(claim);
				if (claim.id && claim.debate_id) {
					mapped.children = await getClaimChildren(claim.id, Number(claim.debate_id));
				}
				return mapped;
			})
		);

		return mappedClaims;
	} catch (error) {
		console.error('Error loading root claims:', error);
		throw error;
	}
}

/**
 * Crea un nuovo claim
 */
export async function createClaim(data: {
	debate_id: number;
	content: string;
	type: 'pro' | 'contro' | 'neutro';
	parent_id?: number | null;
}): Promise<Claim> {
	try {
		const newClaim = await directus.request(
			createItem('claims', {
				debate_id: data.debate_id,
				content: data.content,
				type: data.type,
				parent_id: data.parent_id || null,
				status: 'draft' // I nuovi claims partono come draft
			})
		);

		return mapDirectusClaimToFrontend(newClaim as DirectusClaim);
	} catch (error) {
		console.error('Error creating claim:', error);
		throw error;
	}
}

/**
 * Mappa un claim Directus al formato frontend
 */
function mapDirectusClaimToFrontend(claim: DirectusClaim): Claim {
	return {
		id: String(claim.id || ''),
		debate_id: String(claim.debate_id || ''),
		content: claim.content || '',
		type: (claim.type as 'pro' | 'contro' | 'neutro') || 'neutro',
		parent_id: claim.parent_id ? String(claim.parent_id) : null,
		votes: {
			accuracy: 0, // Verrà popolato separatamente
			relevance: 0
		},
		children: [],
		user_updated: claim.user_updated || undefined,
		date_updated: claim.date_updated || undefined,
		status: (claim.status as 'draft' | 'published' | 'flagged') || 'draft'
	};
}
