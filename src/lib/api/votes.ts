import { directus } from '$lib/directus';
import { readItems, createItem, updateItem } from '@directus/sdk';
import type { Vote } from '$lib/types';

export async function upsertVote(
	argumentId: number,
	value: number,
	userId?: string
): Promise<number> {
	try {
		const existingVotes = await directus.request(
			readItems('votes', {
				filter: {
					argument_id: { _eq: argumentId },
					...(userId ? { user_created: { _eq: userId } } : {})
				}
			})
		);

		if (existingVotes.length > 0) {
			const existingVote = existingVotes[0];
			if (!existingVote.id) throw new Error('Vote ID missing');
			
			const currentValue = existingVote.vote || 0;
			const finalValue = currentValue === value ? 0 : value;
			const delta = finalValue - currentValue;
			
			await directus.request(
				updateItem('votes', existingVote.id, {
					vote: finalValue
				})
			);
			
			return delta;
		} else {
			await directus.request(
				createItem('votes', {
					argument_id: argumentId,
					vote: value
				})
			);
			return value;
		}
	} catch (error) {
		console.error('Error upserting vote:', error);
		throw error;
	}
}

export async function getArgumentVotes(argumentId: number): Promise<number> {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					argument_id: { _eq: argumentId }
				}
			})
		);

		const totalScore = votes.reduce(
			(acc, vote) => acc + (vote.vote || 0),
			0
		);

		return totalScore;
	} catch (error) {
		console.error('Error getting argument votes:', error);
		throw error;
	}
}

export async function getMultipleArgumentVotes(argumentIds: number[]): Promise<Map<number, number>> {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					argument_id: { _in: argumentIds }
				}
			})
		);

		const votesByArgumentId = new Map<number, number>();
		
		votes.forEach(vote => {
			const argumentId = vote.argument_id as number;
			const existing = votesByArgumentId.get(argumentId) || 0;
			votesByArgumentId.set(argumentId, existing + (vote.vote || 0));
		});

		return votesByArgumentId;
	} catch (error) {
		console.error('Error getting multiple argument votes:', error);
		throw error;
	}
}

export async function getUserVote(argumentId: number, userId?: string): Promise<Vote | null> {
	try {
		const votes = await directus.request(
			readItems('votes', {
				filter: {
					argument_id: { _eq: argumentId },
					...(userId ? { user_created: { _eq: userId } } : {})
				},
				limit: 1
			})
		);

		if (votes.length > 0) {
			const v = votes[0];
			return {
				id: v.id || 0,
				argument_id: v.argument_id || 0,
				vote: v.vote || 0,
				user_created: v.user_created || '',
				date_updated: v.date_updated || undefined
			};
		}
		return null;
	} catch (error) {
		console.error('Error getting user vote:', error);
		return null;
	}
}
