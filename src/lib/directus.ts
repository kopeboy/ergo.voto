import { createDirectus, rest } from '@directus/sdk';

const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

export const directus = createDirectus(directusUrl).with(rest());

export type DirectusSchema = {
	claims: any[];
	votes: any[];
};
