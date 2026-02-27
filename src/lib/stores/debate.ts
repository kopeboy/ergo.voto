import { writable } from 'svelte/store';
import type { Debate } from '$lib/types';

export const debateStore = writable<Debate | null>(null);
