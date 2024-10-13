<script lang="ts">
	import { type FireData } from '$lib/fire-api';
	import { DateTime } from 'luxon';

	export let fireData: FireData;
</script>

<h2>Fire data</h2>
<div>
	{#if fireData.metadata.isoTimestamp}
		<p>
			Data timestamp: {DateTime.fromISO(fireData.metadata.isoTimestamp).toLocaleString(
				DateTime.DATETIME_MED
			)}
		</p>
	{/if}
	<p>Open incidents: {fireData.metadata.openIncidents}</p>
</div>

<h2>Incidents</h2>
{#each fireData.incidents as incident}
	<div class="incident">
		<h3>{incident.number} - {incident.parsedCode ?? incident.code}</h3>
		<p>Alarm level: {incident.alarm}</p>
		<p>Address: {incident.address}</p>
		<p>Assigned apparatus:</p>
		<dl>
			{#each incident.assignedApparatus as apparatus}
				<dt>{apparatus.prefix} {apparatus.number}</dt>
				<dd>{apparatus.status}</dd>
			{/each}
		</dl>
	</div>
{/each}

<style>
	.incident {
		margin-bottom: 1rem;
	}
</style>
