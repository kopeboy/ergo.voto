import { getRootArguments } from './arguments';
import { getMultipleArgumentVotes } from './votes';
import type { Argument } from '$lib/types';

export async function getDebateTree(debateId: number): Promise<Argument[]> {
	try {
		const args = await getRootArguments(debateId);
		const allArgumentIds = extractAllArgumentIds(args);
		const votesMap = await getMultipleArgumentVotes(allArgumentIds);
		const argsWithVotes = populateVotes(args, votesMap);
		return argsWithVotes;
	} catch (error) {
		console.error('Error loading debate tree:', error);
		throw error;
	}
}

function extractAllArgumentIds(args: Argument[]): number[] {
	const ids: number[] = [];
	
	function extract(arg: Argument) {
		ids.push(arg.id);
		if (arg.children) {
			arg.children.forEach(extract);
		}
	}
	
	args.forEach(extract);
	return ids;
}

function populateVotes(
	args: Argument[],
	votesMap: Map<number, number>
): Argument[] {
	return args.map(arg => {
		const vote_score = votesMap.get(arg.id) || 0;
		
		return {
			...arg,
			vote_score,
			children: arg.children ? populateVotes(arg.children, votesMap) : []
		};
	});
}

export { getRootArguments, getArgumentTree, getArguments, createArgument } from './arguments';
export { upsertVote, getArgumentVotes, getUserVote } from './votes';
export { getArgumentSources, createSource } from './sources';
export { getDebates, getDebate, createDebate } from './debates';
