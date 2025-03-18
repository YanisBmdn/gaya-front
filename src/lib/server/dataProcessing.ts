import path from 'path';
import fs from 'fs/promises';

const topicOfInterest = ['Temperatures', 'Air Pollution'];
const userGroup = ['control', 'proposedMethod'];

export const getTopicOfInterest = () => {
    const randomIndex = Math.floor(Math.random() * topicOfInterest.length);
    return topicOfInterest[randomIndex];
}

export const getUserGroup = () => {
    const randomIndex = Math.floor(Math.random() * userGroup.length);
    return userGroup[randomIndex];
}

export interface SurveyData {
    id: string;
    budget: number;
    totalAllocated: number;
    budgetDistribution: BudgetDistributionData[];
    confidence: number;
    explanation: string;
    group: string;
}

export interface BudgetDistributionData {
    category: string;
    amount: number;
    percentage: number;
}

const DATA_DIR = 'src/lib/server/';
const PRE_SURVEY_FILE = path.join(DATA_DIR, 'presurvey.jsonl');
const POST_SURVEY_PATH = path.join(DATA_DIR, 'postsurvey.jsonl');

// Ensure directories exist before using them
async function ensureDirectoryExists(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
      await fs.access(dirname);
    } catch (error) {
      await fs.mkdir(dirname, { recursive: true });
    }
  }
  
export async function appendToJSONL(data: SurveyData, step: "pre" | "post"): Promise<void> {
    const JSONL_PATH = step === 'pre' ? PRE_SURVEY_FILE : POST_SURVEY_PATH;
    
    try {
        ensureDirectoryExists(DATA_DIR);
        
        // Check if file exists, create it if it doesn't
        try {
            await fs.access(JSONL_PATH);
        } catch (error) {
            // Create empty file if it doesn't exist
            await fs.writeFile(JSONL_PATH, '', { encoding: 'utf-8' });
            console.log(`Created new file at ${JSONL_PATH}`);
        }
        
        // Read the file
        let existingData: string[] = [];
        const fileContent = await fs.readFile(JSONL_PATH, 'utf-8');
        existingData = fileContent.trim() ? fileContent.trim().split('\n') : [];

        // Check if the ID already exists
        if (existingData.some(line => {
            try {
                return JSON.parse(line).id === data.id;
            } catch {
                return false; // Ignore invalid JSON lines
            }
        })) {
            console.log(`Entry with ID ${data.id} already exists.`);
            return;
        }

        // Append the new entry
        const line = JSON.stringify(data);
        await fs.appendFile(JSONL_PATH, line + '\n', { encoding: 'utf-8' });
        console.log(`Entry with ID ${data.id} added.`);
    } catch (err) {
        console.error('Error appending to JSONL:', err);
        throw err; // Re-throw to allow calling code to handle the error
    }
}