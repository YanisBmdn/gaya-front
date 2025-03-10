import path from 'path';
import fs from 'fs/promises';

export interface SurveyData {
    id: string;
    budget: number;
    totalAllocated: number;
    budgetDistribution: BudgetDistributionData[];
    confidence: number;
    explanation: string;
}

export interface BudgetDistributionData {
    category: string;
    amount: number;
    percentage: number;
}

const JSONL_PATH = path.resolve('src/lib/server/postsurvey.jsonl');

export async function appendToJSONL(data: SurveyData): Promise<void> {
    try{

        // Read the file if it exists
        let existingData: string[] = [];
        try {
            const fileContent = await fs.readFile(JSONL_PATH, 'utf-8');
            existingData = fileContent.trim().split('\n');
        } catch (err) {
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

