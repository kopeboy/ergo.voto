import { directus } from '$lib/directus';
import { readItems, createItem } from '@directus/sdk';
import type { Debate } from '$lib/types';
import type { components } from '$lib/generated-types';

type DirectusDebate = components['schemas']['ItemsDebates'];

/**
 * Carica tutti i debates pubblicati
 */
export async function getDebates(): Promise<Debate[]> {
	try {
		const debates = await directus.request(
			readItems('debates', {
				filter: {
					status: { _eq: 'published' }
				},
				sort: ['-date_updated'],
				limit: -1
			})
		);

		return debates.map(mapDirectusDebateToFrontend);
	} catch (error) {
		console.error('Error loading debates:', error);
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
	title: string;
	question: string;
	description?: string;
}): Promise<Debate> {
	try {
		const newDebate = await directus.request(
			createItem('debates', {
				title: data.title,
				question: data.question,
				description: data.description || null,
				status: 'draft' // I nuovi debates partono come draft
			})
		);

		return mapDirectusDebateToFrontend(newDebate as DirectusDebate);
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
		id: String(debate.id || ''),
		title: debate.title || '',
		description: debate.description || undefined,
		question: debate.question || '',
		status: (debate.status as 'draft' | 'published' | 'closed') || 'draft',
		user_updated: debate.user_updated || undefined,
		date_updated: debate.date_updated || undefined
	};
}
