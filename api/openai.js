import { NowRequest, NowResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req = NowRequest, res = NowResponse) {
    const { prompt } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Failed to fetch from OpenAI API' });
    }
}
