export type ClaimType = 'pro' | 'contro' | 'neutro';

export type VoteDimension = 'accuracy' | 'relevance';

export interface Vote {
	accuracy: number;
	relevance: number;
}

export interface Claim {
	id: string;
	content: string;
	type: ClaimType;
	parent_id: string | null;
	votes: Vote;
	children?: Claim[];
	user_created?: string;
	date_created?: string;
	date_updated?: string;
	status?: 'draft' | 'published' | 'flagged';
}
