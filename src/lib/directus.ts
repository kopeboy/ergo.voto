import { createDirectus, rest, authentication } from '@directus/sdk';
import type { Schema } from './generated-types';

const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

export const directus = createDirectus<Schema>(directusUrl)
	.with(authentication('cookie'))
	.with(rest());
