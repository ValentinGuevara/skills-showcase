import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] || "fake_key",
});

const promptMyGPT = async (suggestion: number, solution: number, tryNumber: number, limitNumber: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
        let run = await client.beta.threads.createAndRun({
            assistant_id: 'asst_ROwUXjNrn2aiJl6i9Cc7IRMz',
            max_completion_tokens: 350,
            temperature: 0.5,
            model: 'gpt-4o-mini',
            thread: { messages: [{ role: 'user', content: `Give me your sentence for a suggestion of ${suggestion} taking into account that ${solution} is the solution, never repeat the secret number. That is try ${tryNumber} out of ${limitNumber}.` }] }
        });

        while(run.status !== 'completed') {
          run = await client.beta.threads.runs.retrieve(run.thread_id, run.id);
        }

        const messages = await client.beta.threads.messages.list(run.thread_id);

        return resolve((messages.data[0].content[0] as any).text.value);
      } catch (error: any) {
        if (error.response) {
          console.error('API Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      }
  });
  
}

export default {
    promptMyGPT
}