import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	await parent();
	const { fireData } = data;
	return {
		fireData
	};
};
