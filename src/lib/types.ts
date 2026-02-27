export interface Source {
	id: number;
	url: string;
	quote?: string;
	argument_id?: number;
	status: 'published' | 'flagged';
	user_created?: string;
	date_created?: string;
}

export interface Vote {
	id: number;
	argument_id: number;
	vote: number;
	user_created: string;
	date_updated?: string;
}

export interface Argument {
	id: number;
	argument: string;
	debate: number;
	parent: number | null;
	is_objection: boolean;
	vote_score: number;
	status: 'draft' | 'published' | 'archived';
	user_created?: string;
	date_created?: string;
	user_updated?: string;
	date_updated?: string;
	sources?: Source[];
	children?: Argument[];
}

export interface Debate {
	id: number;
	topic: string;
	intro?: string;
	type: 'claim' | 'question';
	question?: string;
	claim?: string;
	tags?: string[];
	status: 'draft' | 'published' | 'archived';
	user_created?: string;
	date_created?: string;
	user_updated?: string;
	date_updated?: string;
}
