import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);
	let nextId = 1;

	return {
		subscribe,
		show: (message: string, type: ToastType = 'info', duration = 3000) => {
			const id = nextId++;
			update(toasts => [...toasts, { id, message, type }]);
			
			if (duration > 0) {
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, duration);
			}
		},
		dismiss: (id: number) => {
			update(toasts => toasts.filter(t => t.id !== id));
		}
	};
}

export const toast = createToastStore();
