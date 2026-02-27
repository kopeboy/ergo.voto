import { directus } from '$lib/directus';
import { readItems, createItem } from '@directus/sdk';
import type { Argument } from '$lib/types';
import type { ItemsArguments } from '$lib/generated-types';

type DirectusArgument = ItemsArguments;

export async function getArguments(debateId: number): Promise<Argument[]> {
	try {
		const args = await directus.request(
			readItems('arguments', {
				filter: {
					debate: { _eq: debateId },
					status: { _eq: 'published' }
				},
				sort: ['-vote_score', '-date_updated'],
				limit: -1
			})
		);

		return args.map(mapDirectusArgumentToFrontend);
	} catch (error) {
		console.error('Error loading arguments:', error);
		throw error;
	}
}

export async function getArgumentTree(argumentId: number, debateId: number): Promise<Argument | null> {
	try {
		const args = await directus.request(
			readItems('arguments', {
				filter: {
					id: { _eq: argumentId },
					debate: { _eq: debateId },
					status: { _eq: 'published' }
				},
				limit: 1
			})
		);

		if (!args || args.length === 0) return null;

		const mappedArgument = mapDirectusArgumentToFrontend(args[0]);
		
		const children = await getArgumentChildren(argumentId, debateId);
		mappedArgument.children = children;

		return mappedArgument;
	} catch (error) {
		console.error('Error loading argument tree:', error);
		throw error;
	}
}

export async function getArgumentChildren(parentId: number, debateId: number): Promise<Argument[]> {
	try {
		const children = await directus.request(
			readItems('arguments', {
				filter: {
					debate: { _eq: debateId },
					parent: { _eq: parentId }
				},
				sort: ['-vote_score', '-date_updated']
			})
		);

		const mappedChildren = await Promise.all(
			children.map(async (child) => {
				const mapped = mapDirectusArgumentToFrontend(child);
				if (child.id) {
					mapped.children = await getArgumentChildren(child.id, debateId);
				}
				return mapped;
			})
		);

		return mappedChildren;
	} catch (error) {
		console.error('Error loading argument children:', error);
		return [];
	}
}

export async function getRootArguments(debateId: number): Promise<Argument[]> {
	try {
		const args = await directus.request(
			readItems('arguments', {
				filter: {
					debate: { _eq: debateId },
					parent: { _null: true }
				},
				sort: ['-vote_score', '-date_updated']
			})
		);

		const mappedArguments = await Promise.all(
			args.map(async (arg) => {
				const mapped = mapDirectusArgumentToFrontend(arg);
				if (arg.id) {
					mapped.children = await getArgumentChildren(arg.id, debateId);
				}
				return mapped;
			})
		);

		return mappedArguments;
	} catch (error) {
		console.error('Error loading root arguments:', error);
		throw error;
	}
}

export async function createArgument(data: {
	debate: number;
	argument: string;
	parent?: number | null;
	is_objection?: boolean;
}): Promise<Argument> {
	try {
		console.log('[API] Creating argument with data:', data);
		const payload = {
			debate: data.debate,
			argument: data.argument,
			parent: data.parent || null,
			is_objection: data.is_objection || false,
			status: 'published'
		};
		console.log('[API] Payload:', payload);
		
		const newArgument = await directus.request(
			createItem('arguments', payload as any)
		);

		console.log('[API] Argument created:', newArgument);
		return mapDirectusArgumentToFrontend(newArgument as ItemsArguments);
	} catch (error) {
		console.error('[API] Error creating argument:', error);
		throw error;
	}
}

function mapDirectusArgumentToFrontend(arg: DirectusArgument): Argument {
	return {
		id: arg.id || 0,
		argument: arg.argument || '',
		debate: arg.debate || 0,
		parent: arg.parent || null,
		is_objection: arg.is_objection || false,
		vote_score: arg.vote_score || 0,
		status: (arg.status as 'draft' | 'published' | 'archived') || 'draft',
		user_created: arg.user_created || undefined,
		date_created: arg.date_created || undefined,
		user_updated: arg.user_updated || undefined,
		date_updated: arg.date_updated || undefined,
		children: []
	};
}
