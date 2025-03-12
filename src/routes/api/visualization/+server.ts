import { json } from '@sveltejs/kit';
import { getVisualization, type VisualizationRequest} from '$lib/index';

export async function POST({ request }) {
    const data: VisualizationRequest = await request.json();
    const visualization = await getVisualization(data);
    return json(visualization);
}