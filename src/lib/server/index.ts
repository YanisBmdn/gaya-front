import { BACKEND_URL } from '$env/static/private';
import type { MessageType } from '$lib';

export interface VisualizationRequest {
  chat_id: string;
  complexity_level: number;
  user_description: string;
  location: string;
  messages: string;
  scenario: string;
  topic: string;
  options: string[];
}

export const getVisualization = async (request: VisualizationRequest, language: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/chat/visualization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language
      },
      body: JSON.stringify({
        chat_id: request.chat_id,
        complexity_level: request.complexity_level,
        user_description: request.user_description,
        location: request.location,
        messages: request.messages,
        scenario: request.scenario,
        topic: request.topic,
        options: request.options
      })
    });
    
    if (response.status !== 200) {
      const errorData = await response.json();
      console.error(`Visualization API Error (Status ${response.status}):`, JSON.stringify(errorData));
      return errorData;
    }
    
    const json = await response.json();
    return json.visualization;
  } catch (error) {
    console.error('Unexpected error in getVisualization:', error);
    throw error;
  }
};

export const chat = async (messages: MessageType, language: string): Promise<Response> => {
  try {
    // API endpoint for the chat service
    // Make request to the external API
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Chat API Error (Status ${response.status}):`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
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
      JSON.stringify({ error: 'Failed to connect to chat service', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const getImageDescription = async (image: Base64URLString, chat_id: string, complexity_level: number, scenario: string, options: string[], language: string): Promise<Response> => {
	try {
	  const response = await fetch(`${BACKEND_URL}/chat/description`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
      'Accept-Language': language
		},
		body: JSON.stringify({ chat_id, image, complexity_level, scenario, options })
	  });
	  
	  if (response.status !== 200) {
		const errorData = await response.json();
		console.error(`Image Description API Error (Status ${response.status}):`, JSON.stringify(errorData));
		throw new Error(`Image description request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
	  }
	  
	  // Return the stream directly instead of parsing as JSON
	  return new Response(response.body, {
		headers: {
		  'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
		  'Cache-Control': 'no-cache',
		  'Connection': 'keep-alive'
		}
	  });
	  
	} catch (error: any) {
	  console.error('Unexpected error in getImageDescription:', error);
	  return new Response(
		JSON.stringify({ error: 'Failed to process image description', details: error.message }),
		{
		  status: 500,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	}
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

export const getScenario = async (scenarioData: ScenarioData, language: string): Promise<ScenarioResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/scenario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language
      },
      body: JSON.stringify(scenarioData)
    });
    
    if (response.status !== 200) {
      const errorData = await response.json();
      console.error(`Scenario API Error (Status ${response.status}):`, JSON.stringify(errorData));
      throw new Error(`Scenario request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Unexpected error in getScenario:', error);
    throw error;
  }
};

export const getComplexityLevel = async (
  userDescription: string,
  ageGroup: string
): Promise<number> => {
  try {
    const response = await fetch(`${BACKEND_URL}/chat/persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: userDescription, age_group: ageGroup })
    });
    
    if (response.status !== 200) {
      const errorData = await response.json();
      console.error(`Complexity Level API Error (Status ${response.status}):`, JSON.stringify(errorData));
      throw new Error(`Complexity level request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const json = await response.json();
    return json.complexity_level;
  } catch (error) {
    console.error('Unexpected error in getComplexityLevel:', error);
    throw error;
  }
};
