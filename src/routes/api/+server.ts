import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import { appendToJSONL, type SurveyData } from '$lib/server/dataProcessing';

export async function POST({ request }) {
    const data: SurveyData = await request.json();
    appendToJSONL(data);
    return json({ success: true });
}