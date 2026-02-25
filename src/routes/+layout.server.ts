export const load = ({ locals }: { locals: App.Locals }) => {
	return {
		user: locals.user || null
	};
};
