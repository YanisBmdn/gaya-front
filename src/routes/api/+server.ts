import { json } from '@sveltejs/kit';
import { appendToJSONL, type SurveyData } from '$lib/server/dataProcessing';

export async function POST({ request }) {
    const data: SurveyData = await request.json();
    appendToJSONL(data, step);
    return json({ success: true });
}