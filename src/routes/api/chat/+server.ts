import { json } from '@sveltejs/kit';
import { chat } from '$lib/index';

export async function POST({ request }) {
    const data = await request.json();
    return chat(data.message);
}