import { json } from '@sveltejs/kit';
import { getScenario, type ScenarioData, type ScenarioResponse } from '$lib/index';

export async function POST({ request }) {
    const data: ScenarioData = await request.json();
    const scenario = await getScenario(data);
    return json(scenario);
}