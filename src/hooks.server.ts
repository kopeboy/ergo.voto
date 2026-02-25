import type { Handle } from '@sveltejs/kit';
import { directus } from '$lib/directus';
import { readMe } from '@directus/sdk';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('[HOOKS] Handle called for:', event.url.pathname);
	
	try {
		console.log('[HOOKS] Attempting to get user from Directus...');
		// Try to get user from Directus using the SDK
		const user = await directus.request(readMe());
		console.log('[HOOKS] User fetched:', user.id, user.email);
		console.log('[HOOKS] User role (raw):', user.role);
		
		// If user has a role UUID, fetch the role name
		let roleName: string | undefined = undefined;
		const roleId = (user.role as any);
		
		if (roleId && typeof roleId === 'string') {
			console.log('[HOOKS] Fetching role name for UUID:', roleId);
			try {
				const token = await directus.getToken();
				console.log('[HOOKS] Token exists:', !!token);
				if (token) {
					const url = `${directus.url}`.replace(/\/$/, '');
					const roleUrl = `${url}/roles/${roleId}`;
					console.log('[HOOKS] Fetching from:', roleUrl);
					const response = await fetch(roleUrl, {
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
					console.log('[HOOKS] Role fetch status:', response.status);
					if (response.ok) {
						const data = await response.json();
						roleName = data.data?.name;
						console.log('[HOOKS] Role name:', roleName);
					} else {
						const errorText = await response.text();
						console.error('[HOOKS] Role fetch failed:', errorText);
					}
				}
			} catch (roleError) {
				console.error('[HOOKS] Role fetch error:', roleError);
			}
		}
		
		// Attach user with role name to locals
		event.locals.user = {
			id: user.id,
			email: user.email || '',
			first_name: user.first_name || undefined,
			last_name: user.last_name || undefined,
			role: roleName
		};
		console.log('[HOOKS] User attached to locals:', event.locals.user);
	} catch (error) {
		// User not authenticated or token invalid
		console.log('[HOOKS] No authenticated user:', error);
		event.locals.user = null;
	}

	return await resolve(event);
};
