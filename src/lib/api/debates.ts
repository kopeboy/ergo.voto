import { directus } from '$lib/directus';
import { readItems, createItem } from '@directus/sdk';
import type { Debate } from '$lib/types';
import type { ItemsDebates } from '$lib/generated-types';

type DirectusDebate = ItemsDebates;

/**
 * Carica tutti i debates pubblicati
 */
export async function getDebates(): Promise<Debate[]> {
	try {
		console.log('[API] Fetching debates...');
		const debates = await directus.request(
			readItems('debates', {
				filter: {
					status: { _eq: 'published' }
				},
				sort: ['-date_updated'],
				limit: -1
			})
		);

		console.log('[API] Debates received:', debates);
		const mapped = debates.map(mapDirectusDebateToFrontend);
		console.log('[API] Debates mapped:', mapped);
		return mapped;
	} catch (error) {
		console.error('[API] Error loading debates:', error);
		throw error;
	}
}

/**
 * Carica un singolo debate
 */
export async function getDebate(debateId: string | number): Promise<Debate | null> {
	try {
		const debates = await directus.request(
			readItems('debates', {
				filter: {
					id: { _eq: Number(debateId) },
					status: { _eq: 'published' }
				},
				limit: 1
			})
		);

		if (!debates || debates.length === 0) return null;

		return mapDirectusDebateToFrontend(debates[0]);
	} catch (error) {
		console.error('Error loading debate:', error);
		throw error;
	}
}

/**
 * Crea un nuovo debate (solo utenti Pro)
 */
export async function createDebate(data: {
	topic: string;
	type: 'claim' | 'question';
	intro?: string;
	question?: string;
	claim?: string;
	tags?: string[];
}): Promise<Debate> {
	try {
		const newDebate = await directus.request(
			createItem('debates', {
				topic: data.topic,
				type: data.type,
					intro: data.intro || undefined,
				question: data.question || undefined,
				claim: data.claim || undefined,
				tags: data.tags || null,
				status: 'draft'
			})
		);

		return mapDirectusDebateToFrontend(newDebate as ItemsDebates);
	} catch (error) {
		console.error('Error creating debate:', error);
		throw error;
	}
}

/**
 * Mappa un debate Directus al formato frontend
 */
function mapDirectusDebateToFrontend(debate: DirectusDebate): Debate {
	return {
		id: debate.id || 0,
		topic: debate.topic || '',
		intro: debate.intro || undefined,
		type: (debate.type as 'claim' | 'question') || 'claim',
		question: debate.question || undefined,
		claim: debate.claim || undefined,
		tags: (debate as any).tags || undefined,
		status: (debate.status as 'draft' | 'published' | 'archived') || 'draft',
		user_created: debate.user_created || undefined,
		date_created: debate.date_created || undefined,
		user_updated: debate.user_updated || undefined,
		date_updated: debate.date_updated || undefined
	};
}
