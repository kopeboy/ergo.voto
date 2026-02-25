export type ClaimType = 'pro' | 'contro' | 'fatto' | 'neutro';

export type VoteDimension = 'accuracy' | 'relevance';

export interface Vote {
	accuracy: number;
	relevance: number;
}

export interface Claim {
	id: string;
	debate_id: string;
	content: string;
	type: ClaimType;
	parent_id: string | null;
	votes: Vote;
	children?: Claim[];
	user_updated?: string;
	date_updated?: string;
	status?: 'draft' | 'published' | 'flagged';
	citations?: string[]; // IDs delle claims/fatti citati per sillogismi
	is_ergo?: boolean; // True se questa claim è una deduzione logica
}

export interface Debate {
	id: string;
	title: string;
	description?: string;
	question: string;
	status: 'draft' | 'published' | 'closed';
	user_updated?: string;
	date_updated?: string;
}
