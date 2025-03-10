import { BACKEND_URL } from "$env/static/private";

const getImageDescription = async (image: Base64URLString): Promise<string> => {
    const response = await fetch(`${BACKEND_URL}/chat/description`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
    });
    const json = await response.json();
    return json.explanation;
};

export interface ScenarioData {
    chat_id: string;
    user_description: string;
    location: string;
    age_group: string;
}

export interface ScenarioResponse {
    scenario: string;
    budget: number;
    options: string[];
}

export const getScenario = async (scenarioData: ScenarioData): Promise<ScenarioResponse> => {
    const response = await fetch(`${BACKEND_URL}/scenario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenarioData),
    });
    const json = await response.json();
    return json;
}