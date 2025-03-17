import { env } from '$env/dynamic/private';
import { readFileSync } from 'fs';
import path from 'path';

const DATA_DIR = '/data';
const PRE_SURVEY_FILE = path.join(DATA_DIR, 'presurvey.jsonl');
const POST_SURVEY_PATH = path.join(DATA_DIR, 'postsurvey.jsonl');

export async function POST({ request }) {
    const body = await request.json()
    if (body.password === env.PASSWORD){
        try {
    
            // Read file contents as strings
            console.log(process.cwd());
            const file1Content = readFileSync(PRE_SURVEY_FILE, 'utf-8');
            const file2Content = readFileSync(POST_SURVEY_PATH, 'utf-8');
            
            // Return both files in a JSON response
            return new Response(JSON.stringify({
              file1: file1Content,
              file2: file2Content
            }), {
              headers: {
                'Content-Type': 'application/json'
              }
            });
          } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
    }
    else{
        return new Response(JSON.stringify({ error: 'Invalid password' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          });
    }
}