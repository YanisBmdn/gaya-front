import { json } from '@sveltejs/kit';
import { getVisualization, type VisualizationRequest} from '$lib/server/index';

export async function POST({ request }) {
    const data: VisualizationRequest = await request.json();
    const language = request.headers.get('Accept-Language') || 'en';
    const visualization = await getVisualization(data, language);
    return json(visualization);
}