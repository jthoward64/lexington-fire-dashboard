<script lang="ts">
	import type { apparatus, apparatusAssignment, incidents, Prisma } from '@prisma/client';
	import { DateTime } from 'luxon';
	import { parseApparatusStatus } from './fire-api';

	export let activeIncidents: (incidents & {
		assignments: apparatusAssignment[];
	})[];
	export let incidentsToday: (incidents & { apparatusAssignmentCount: number })[];
	export let oldestTimestamp: number;

	const incidentsByAlarm: Record<
		number,
		(incidents & {
			assignments: apparatusAssignment[];
		})[]
	> = {};
	for (const incident of activeIncidents) {
		if (!incidentsByAlarm[incident.alarm]) {
			incidentsByAlarm[incident.alarm] = [];
		}
		incidentsByAlarm[incident.alarm].push(incident);
	}
	const sortedIncidents = Object.values(incidentsByAlarm)
		.map((incidents) =>
			Object.values(Object.groupBy(incidents, (incident) => incident.code)).flat()
		)
		.flat();
</script>

<h2 class="text-2xl font-bold mb-4">Summary</h2>
<div class="mb-6">
	{#if oldestTimestamp}
		<p class="text-gray-600">
			Data timestamp: {DateTime.fromMillis(oldestTimestamp).toLocaleString(DateTime.DATETIME_MED)}
		</p>
	{/if}
	<p class="text-gray-600">Open incidents: {activeIncidents.length}</p>
</div>

<h2 class="text-2xl font-bold mb-4">Incidents</h2>
{#each sortedIncidents as incident}
	{#if incident}
		<div class="mb-6">
			<h3 class="text-xl font-bold mb-2">
				Incident #{incident.number} - {incident.parsedCode ?? incident.code}
				{#if incident.alarm > 1}
					<span class="text-red-600">({incident.alarm} alarms)</span>
				{/if}
			</h3>
			<p class="text-gray-600">Location: {incident.address}</p>
			<div class="flex flex-wrap">
				{#each incident.assignments as assignment}
					<div
						class="rounded-full px-2 py-1 text-sm mr-2 mb-2 apparatus-status-{assignment.status
							.toLowerCase()
							.replace(' ', '-')}"
						title={assignment.status}
					>
						{assignment.apparatusPrefix}{assignment.apparatusNumber}
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/each}

<h2 class="text-2xl font-bold mb-4">Inactive Incidents (last 24 hours)</h2>
<!-- This is more of a table layout -->
<table class="w-full">
	<thead>
		<tr>
			<th class="text-left">Incident</th>
			<th class="text-left">Code</th>
			<th class="text-left">Location</th>
			<th class="text-left">Apparatus</th>
		</tr>
	</thead>
	<tbody>
		{#each incidentsToday
			.sort((a, b) => a.number - b.number)
			.filter( (incident) => activeIncidents.every((activeIncident) => activeIncident.number !== incident.number) ) as incident}
			<tr>
				<td class="border-b border-gray-200 py-2">
					{incident.number}
				</td>
				<td class="border-b border-gray-200 py-2">
					{incident.parsedCode ?? incident.code}
				</td>
				<td class="border-b border-gray-200 py-2">
					{incident.address}
				</td>
				<td class="border-b border-gray-200 py-2">
					{incident.apparatusAssignmentCount}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.apparatus-status-enroute {
		background-color: #f6e05e;
	}
	.apparatus-status-at-scene {
		background-color: #68d391;
	}
	.apparatus-status-transporting {
		background-color: #63b3ed;
	}
	.apparatus-status-at-hospital {
		background-color: #f687b3;
	}
	.apparatus-status-dispatched {
		background-color: #f6ad55;
	}
	.apparatus-status-unknown {
		background-color: #d1d5db;
	}
</style>
