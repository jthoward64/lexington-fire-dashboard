<script lang="ts">
	import Fire from '$lib/fire.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="text-2xl font-bold mb-4">Lexington Fire Data</h1>
<p class="mb-6">
	This page shows current and historical data reported by the Lexington Fire Department. This site
	is not affiliated with the Lexington Fire Department.
</p>
<Fire
	activeIncidents={data.fireData.activeIncidents}
	incidentsToday={data.fireData.incidentsToday}
	oldestTimestamp={data.fireData.oldestTimestamp}
/>
