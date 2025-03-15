import { json } from '@sveltejs/kit';
import { getComplexityLevel } from '$lib/server/index';

export async function POST({ request }) {
    const data = await request.json();
    const complexityLevel = await getComplexityLevel(data.user_description, data.age_group);
    return json(complexityLevel);
}