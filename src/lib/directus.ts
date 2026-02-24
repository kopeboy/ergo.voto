import { createDirectus, rest, authentication } from '@directus/sdk';
import type { Schema } from './generated-types';

const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

// Storage personalizzato per persistere i token in localStorage
const authStorage = {
	get: () => {
		const data = localStorage.getItem('directus-auth');
		return data ? JSON.parse(data) : null;
	},
	set: (data: any) => {
		if (data === null) {
			localStorage.removeItem('directus-auth');
		} else {
			localStorage.setItem('directus-auth', JSON.stringify(data));
		}
	}
};

export const directus = createDirectus<Schema>(directusUrl)
	.with(authentication('json', { storage: authStorage }))
	.with(rest());
