import { directus } from '$lib/directus';
import { readItems, createItem } from '@directus/sdk';
import type { Source } from '$lib/types';
import type { ItemsSources } from '$lib/generated-types';

type DirectusSource = ItemsSources;

export async function getArgumentSources(argumentId: number): Promise<Source[]> {
	try {
		const sources = await directus.request(
			readItems('sources', {
				filter: {
					argument_id: { _eq: argumentId },
					status: { _eq: 'published' }
				},
				sort: ['date_created'],
				limit: -1
			})
		);

		return sources.map(mapDirectusSourceToFrontend);
	} catch (error) {
		console.error('Error loading sources:', error);
		throw error;
	}
}

export async function createSource(data: {
	argument_id: number;
	url: string;
	quote?: string;
}): Promise<Source> {
	try {
		const newSource = await directus.request(
			createItem('sources', {
				argument_id: data.argument_id,
				url: data.url,
				quote: data.quote || null,
				status: 'published'
			} as any)
		);

		return mapDirectusSourceToFrontend(newSource as ItemsSources);
	} catch (error) {
		console.error('Error creating source:', error);
		throw error;
	}
}

function mapDirectusSourceToFrontend(source: DirectusSource): Source {
	return {
		id: source.id || 0,
		url: source.url || '',
		quote: source.quote || undefined,
		argument_id: source.argument_id || undefined,
		status: (source.status as 'published' | 'flagged') || 'published',
		user_created: source.user_created || undefined,
		date_created: source.date_created || undefined
	};
}
