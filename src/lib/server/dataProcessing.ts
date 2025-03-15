import path from 'path';
import fs from 'fs/promises';

const topicOfInterest = ['Temperatures', 'Air Pollution']
const userGroup = ['Control','proposedMethod']

let topicIndex = 0;
let groupIndex = 0;

export const getTopicOfInterest = () => {
    const topic = topicOfInterest[topicIndex];
    topicIndex = (topicIndex + 1) % topicOfInterest.length;
    return topic;
}

export const getUserGroup = () => {
    const group = userGroup[groupIndex];
    groupIndex = (groupIndex + 1) % userGroup.length;
    return group;
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

const PRE_SURVEY_FILE = path.resolve('src/lib/server/presurvey.jsonl');
const POST_SURVEY_PATH = path.resolve('src/lib/server/postsurvey.jsonl');

export async function appendToJSONL(data: SurveyData, step: "pre" | "post"): Promise<void> {
    try{
        const JSONL_PATH = step === 'pre' ? PRE_SURVEY_FILE : POST_SURVEY_PATH;
        // Read the file if it exists
        let existingData: string[] = [];
        try {
            const file = step === 'pre' ? PRE_SURVEY_FILE : POST_SURVEY_PATH;
            const fileContent = await fs.readFile(file, 'utf-8');
            existingData = fileContent.trim().split('\n');
        } catch (err : any) {
            if (err.code !== 'ENOENT') throw err; // Ignore "file not found" error
        }

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
    }
}

