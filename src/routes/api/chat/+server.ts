import { json } from '@sveltejs/kit';
import { chat } from '$lib/server/index';

export async function POST({ request }) {
    const data = await request.json();
    const language = request.headers.get('Accept-Language') || 'en';
    return chat(data.messages, language);
}