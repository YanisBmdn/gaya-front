import { BACKEND_URL } from '$env/static/private';

export interface VisualizationRequest {
	chat_id: string;
	complexity_level: number;
    user_description: string;
	location: string;
	message: string;
	scenario: string;
	topic: string;
	options: string[];
}

export const getVisualization = async (request: VisualizationRequest): Promise<string> => {
	const response = await fetch(`${BACKEND_URL}/chat/visualization`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: request.chat_id,
			complexity_level: request.complexity_level,
			user_description: request.user_description,
			location: request.location,
			message: request.message,
			scenario: request.scenario,
			topic: request.topic,
			options: request.options
		})
	});
	if (response.status !== 200) {
		const error = await response.json();
		console.error(`Error: ${JSON.stringify(error)}`);
	}
	const json = await response.json();
	return json.explanation;
};

export const chat = async (message: string): Promise<Response> => {
	try {
	  // API endpoint for the chat service
	  
	  // Make request to the external API
	  const response = await fetch(`${BACKEND_URL}/chat`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 
		  message: message,
		}),
	  });
	  
	  // Check if the request was successful
	  if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	  }
	  
	  // Return a new Response object with the same body to maintain the stream
	  return new Response(response.body, {
		headers: {
		  'Content-Type': 'text/event-stream',
		  'Cache-Control': 'no-cache',
		  'Connection': 'keep-alive'
		}
	  });
	} catch (error) {
	  console.error('Error in chat function:', error);
	  
	  // Return an error response
	  return new Response(
		JSON.stringify({ error: 'Failed to connect to chat service' }),
		{ 
		  status: 500,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	}
  };

export const getImageDescription = async (image: Base64URLString): Promise<string> => {
	const response = await fetch(`${BACKEND_URL}/chat/description`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ image })
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
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(scenarioData)
	});
	const json = await response.json();
	return json;
};

export const getComplexityLevel = async (
	userDescription: string,
	ageGroup: string
): Promise<number> => {
	const response = await fetch(`${BACKEND_URL}/chat/persona`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ description: userDescription, age_group: ageGroup })
	});
	const json = await response.json();
	return json.complexity_level;
};
