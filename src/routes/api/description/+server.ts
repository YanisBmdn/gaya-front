import { json } from '@sveltejs/kit';
import { getImageDescription } from '$lib/server/index';

export async function POST({ request }) {
    const data = await request.json();
    const language = request.headers.get('Accept-Language') || 'en';
    const description = await getImageDescription(data.image, data.chat_id, data.complexity_level, language);
    return json(description);
}