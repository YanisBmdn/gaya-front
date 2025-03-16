import { env } from '$env/dynamic/private';
import { readFileSync } from 'fs';

export async function POST({ request }) {
    const body = await request.json()
    if (body.password === env.PASSWORD){
        try {
    
            // Read file contents as strings
            console.log(process.cwd());
            const file1Content = readFileSync('src/lib/server/presurvey.jsonl', 'utf-8');
            const file2Content = readFileSync('src/lib/server/postsurvey.jsonl', 'utf-8');
            
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