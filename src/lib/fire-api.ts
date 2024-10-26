import { HTMLElement, Node, parse } from 'node-html-parser';
import fireCodes from './fire-codes';
import { DateTime } from 'luxon';

export type ApparatusStatus =
	| 'Enroute'
	| 'At Scene'
	| 'Transporting'
	| 'At Hospital'
	| 'Dispatched'
	| 'Unknown';

export interface Apparatus {
	prefix: string;
	number: string;
	status: ApparatusStatus;
}

export interface Incident {
	number: string;
	code: string;
	parsedCode?: string;
	alarm: number;
	enroute?: string;
	arrive?: string;
	address: string;
	assignedApparatus: Apparatus[];
}

export interface Metadata {
	timestamp: DateTime;
	openIncidents: number;
}

export interface FireData {
	metadata: Metadata;
	incidents: Incident[];
}

export function parseApparatusStatus(className: string): ApparatusStatus {
	switch (className) {
		case 'nrt':
			return 'Enroute';
		case 'atscene':
			return 'At Scene';
		case 'transporting':
			return 'Transporting';
		case 'arrived':
			return 'At Hospital';
		case 'dispatched':
			return 'Dispatched';
		default:
			return 'Unknown';
	}
}

function parseApparatus(data: Node): Apparatus {
	if (!(data instanceof HTMLElement)) {
		throw new Error('Invalid apparatus data');
	}
	const prefix = data.textContent?.split(/\d/)[0] ?? '';
	const number = data.textContent?.split(/\D/).pop() ?? '';
	let status: ApparatusStatus = 'Unknown';
	for (const className of data.classList.values()) {
		try {
			status = parseApparatusStatus(className);
		} catch {
			continue;
		}
	}
	return { prefix, number, status };
}

function parseIncident(data: HTMLElement): Incident {
	const elements = data.childNodes.filter(
		(el) => el.textContent.length === 0 || el.textContent.trim().length !== 0
	);
	console.log(elements);
	if (elements.length !== 7) {
		throw new Error('Invalid incident data');
	}
	const number = elements[0].textContent ?? '[ERR]';
	const code = elements[1].textContent ?? '[ERR]';
	const parsedCode = fireCodes[code];
	const alarm = Number(elements[2].textContent ?? '[ERR]');
	const enroute = elements[3].textContent ?? undefined;
	const arrive = elements[4].textContent ?? undefined;
	const address = elements[5].textContent ?? '[ERR]';
	const assignedApparatus: Apparatus[] = [];
	for (const apparatusData of elements[6].childNodes.filter(
		(el) => el.textContent.length === 0 || el.textContent.trim().length !== 0
	)) {
		assignedApparatus.push(parseApparatus(apparatusData));
	}
	return { number, code, parsedCode, alarm, enroute, arrive, address, assignedApparatus };
}

// Rate limit to once every 1 second
let lastQuery = DateTime.fromMillis(0);
let lastResult: HTMLElement | null = null;

async function queryFireApi(): Promise<HTMLElement> {
	if (DateTime.now().diff(lastQuery).as('seconds') < 1) {
		return lastResult!;
	}

	try {
		// @ts-expect-error - We are on server side, process is available
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
		const response = await fetch('https://fire.lexingtonky.gov//open/status/status.htm');
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}
		const text = await response.text();
		const element = parse(text);
		lastQuery = DateTime.now();
		lastResult = element;
		return element;
	} finally {
		// @ts-expect-error - We are on server side, process is available
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
	}
}

function getIncidents(documents: HTMLElement): Incident[] {
	const incidents: Incident[] = [];
	const data = documents.querySelectorAll('body > div.data');
	for (const incidentData of data) {
		incidents.push(parseIncident(incidentData));
	}
	return incidents;
}

const timestampRegex = /(\d+\/\d+\/\d+)\s-\s(\d+:\d+:\d+)/;
const incidentsRegex = /(\d+)\sOpen\sIncidents/;

function getMetadata(documents: HTMLElement): Metadata {
	const header = documents.querySelector('body > div.wrapper > div.header');
	if (!header) {
		throw new Error('Invalid metadata');
	}
	const timestampMatch = header.textContent?.match(timestampRegex);
	const incidentsMatch = header.textContent?.match(incidentsRegex);
	if (!timestampMatch || !incidentsMatch) {
		throw new Error('Invalid metadata');
	}
	const timestamp = DateTime.fromFormat(
		`${timestampMatch[1]} - ${timestampMatch[2]}`,
		'M/d/y - H:m:s',
		{
			zone: 'America/New_York'
		}
	);
	const openIncidents = Number(incidentsMatch[1]);
	return { timestamp, openIncidents };
}

export async function getFireData(): Promise<FireData> {
	const documents = await queryFireApi();
	return {
		metadata: getMetadata(documents),
		incidents: getIncidents(documents)
	};
}
