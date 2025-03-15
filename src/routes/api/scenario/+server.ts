import { json } from '@sveltejs/kit';
import { getScenario, type ScenarioData, type ScenarioResponse } from '$lib/server/index';
import { get } from 'svelte/store';

export async function POST({ request }) {
    const data: ScenarioData = await request.json();
    const language = request.headers.get('Accept-Language') || 'en';
    const scenario = await getScenario(data, language);
    return json(scenario);
}