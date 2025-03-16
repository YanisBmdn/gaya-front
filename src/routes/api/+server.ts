import { json } from '@sveltejs/kit';
import { appendToJSONL, getTopicOfInterest, getUserGroup, type SurveyData } from '$lib/server/dataProcessing';

export async function POST({ request }) {
    const data: SurveyData = await request.json();
    const url = new URL(request.url);
    const step = url.searchParams.get("step");
    if (step !== "pre" && step !== "post") {
        return json({ success: false, error: 'Invalid step' });
    }
    appendToJSONL(data, step);
    return json({ success: true });
}

export async function GET({ params }) {
    const topic = getTopicOfInterest();
    const group = getUserGroup();
    return json({ topic, group: 'proposedMethod' });
}
