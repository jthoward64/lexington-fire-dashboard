import type { apparatusAssignment, incidents } from '@prisma/client';
import { prisma } from './db';
import { type FireData, getFireData } from './fire-api';
import { DateTime } from 'luxon';

async function storeNewFireData({ metadata: { timestamp }, incidents }: FireData): Promise<void> {
	const jsTimestamp = timestamp.toJSDate();

	const incidentData = incidents.map((incident) => ({
		number: Number.parseInt(incident.number, 10),
		code: incident.code,
		parsedCode: incident.parsedCode,
		alarm: incident.alarm,
		enroute: incident.enroute,
		arrive: incident.arrive,
		address: incident.address
	}));

	const assignedApparatusData = incidents.flatMap((incident) =>
		incident.assignedApparatus.map((apparatus) => ({
			incidentNumber: Number.parseInt(incident.number, 10),
			prefix: apparatus.prefix,
			number: apparatus.number,
			status: apparatus.status
		}))
	);

	// We need to:
	// 1. Set any `apparatusAssignment` rows that are no longer assigned to an incident to be inactive
	// 2. Set any `incident` rows that are no longer in the data to be inactive
	// 3. Upsert the apparatuses
	// 4. Create any new `incident` rows
	// 5. Create any new `apparatusAssignment` rows
	// 6. Update any existing `incident` rows
	// 7. Update any existing `apparatusAssignment` rows

	await prisma.$transaction(async (prisma) => {
		await prisma.incidents.updateMany({
			where: {
				number: {
					notIn: incidentData.map((incident) => incident.number)
				}
			},
			data: {
				active: false
			}
		});

		await prisma.apparatusAssignment.updateMany({
			where: {
				incidentsNumber: {
					notIn: incidentData.map((incident) => incident.number)
				}
			},
			data: {
				active: false
			}
		});

		for (const apparatus of assignedApparatusData) {
			await prisma.apparatus.upsert({
				where: {
					prefix_number: {
						prefix: apparatus.prefix,
						number: apparatus.number
					}
				},
				update: {
					lastSeen: jsTimestamp
				},
				create: {
					prefix: apparatus.prefix,
					number: apparatus.number,
					lastSeen: jsTimestamp
				}
			});
		}

		for (const incident of incidentData) {
			await prisma.incidents.upsert({
				where: {
					number: incident.number
				},
				update: {
					code: incident.code,
					parsedCode: incident.parsedCode,
					alarm: incident.alarm,
					enroute: incident.enroute,
					arrive: incident.arrive,
					address: incident.address,
					active: true,
					lastUpdate: jsTimestamp
				},
				create: {
					number: incident.number,
					code: incident.code,
					parsedCode: incident.parsedCode,
					alarm: incident.alarm,
					enroute: incident.enroute,
					arrive: incident.arrive,
					address: incident.address,
					active: true,
					lastUpdate: jsTimestamp
				}
			});
		}

		for (const apparatus of assignedApparatusData) {
			await prisma.apparatusAssignment.upsert({
				where: {
					apparatusPrefix_apparatusNumber_incidentsNumber: {
						incidentsNumber: apparatus.incidentNumber,
						apparatusPrefix: apparatus.prefix,
						apparatusNumber: apparatus.number
					}
				},
				update: {
					status: apparatus.status,
					active: true,
					lastUpdate: jsTimestamp
				},
				create: {
					active: true,
					status: apparatus.status,
					lastUpdate: jsTimestamp,
					apparatus: {
						connect: {
							prefix_number: {
								prefix: apparatus.prefix,
								number: apparatus.number
							}
						}
					},
					incident: {
						connect: {
							number: apparatus.incidentNumber
						}
					}
				}
			});
		}
	});
}

async function loadSavedFireData() {
	const activeIncidents = await prisma.incidents.findMany({
		where: {
			active: true
		},
		include: {
			apparatusAssignment: true
		}
	});

	const incidentsToday = await prisma.incidents.findMany({
		where: {
			lastUpdate: {
				gte: DateTime.now().minus({ days: 1 }).toJSDate()
			}
		},
		include: {
			_count: {
				select: {
					apparatusAssignment: true
				}
			}
		}
	});

	return {
		activeIncidents: activeIncidents.map(
			(incident): incidents & { assignments: apparatusAssignment[] } => ({
				active: true,
				address: incident.address,
				alarm: incident.alarm,
				arrive: incident.arrive,
				code: incident.code,
				enroute: incident.enroute,
				lastUpdate: incident.lastUpdate,
				number: incident.number,
				parsedCode: incident.parsedCode,
				assignments: incident.apparatusAssignment.map(
					(assignment): apparatusAssignment => ({
						active: assignment.active,
						status: assignment.status,
						lastUpdate: assignment.lastUpdate,
						apparatusNumber: assignment.apparatusNumber,
						apparatusPrefix: assignment.apparatusPrefix,
						incidentsNumber: assignment.incidentsNumber
					})
				)
			})
		),
		incidentsToday: incidentsToday.map(
			(incident): incidents & { apparatusAssignmentCount: number } => ({
				active: true,
				address: incident.address,
				alarm: incident.alarm,
				arrive: incident.arrive,
				code: incident.code,
				enroute: incident.enroute,
				lastUpdate: incident.lastUpdate,
				number: incident.number,
				parsedCode: incident.parsedCode,
				apparatusAssignmentCount: incident._count.apparatusAssignment
			})
		),
		oldestTimestamp: activeIncidents.reduce(
			(acc, { lastUpdate }) => Math.min(acc, lastUpdate.getTime()),
			Infinity
		)
	};
}

export async function updateFireData(): Promise<void> {
	const fresh = await getFireData();
	await storeNewFireData(fresh);
}

export async function getFireDataWithCache(): Promise<{
	activeIncidents: (incidents & {
		assignments: apparatusAssignment[];
	})[];
	incidentsToday: (incidents & { apparatusAssignmentCount: number })[];
	oldestTimestamp: number;
}> {
	const saved = await loadSavedFireData();
	const now = DateTime.now();
	if (saved && saved.oldestTimestamp > now.minus({ minutes: 2 }).toMillis()) {
		console.log('Using cached fire data', saved);
		return saved;
	}
	await updateFireData();
	const data = await loadSavedFireData();
	if (!data) {
		throw new Error('Failed to load fire data');
	}
	return data;
}
