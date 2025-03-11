import { json } from '@sveltejs/kit';
import { getImageDescription } from '$lib/index';

export async function POST({ request }) {
    const data = await request.json();
    const description = await getImageDescription(data);
    return json(description);
}