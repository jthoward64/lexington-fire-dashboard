import { getFireData } from '$lib/fire-api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		fireData: await getFireData()
	};
};
