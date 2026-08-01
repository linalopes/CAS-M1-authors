// Simple in-memory rate limiter, scoped to a single warm serverless instance.
// It won't coordinate across cold starts or concurrent instances, but it's
// enough to stop one client from hammering this endpoint and running up the
// OpenAI bill, which is the realistic risk for this project's traffic.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map(); // ip -> recent request timestamps

const MAX_PROMPT_LENGTH = 2000; // real prompts here are a few hundred chars

function isRateLimited(ip) {
    const now = Date.now();
    const recent = (requestLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    requestLog.set(ip, recent);
    return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    }

    console.log('Request Body:', req.body);
    const prompt = req.body.prompt;

    if (!prompt || typeof prompt !== 'string') {
        console.error('Prompt is null, empty, or not a string');
        return res.status(400).json({ error: 'Prompt cannot be null or empty' });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
        console.error('Prompt exceeds max length:', prompt.length);
        return res.status(400).json({ error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters)` });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: "system", content: "You are a creative assistant that helps generate rap battle verses between important authors in the field of AI and machine learning." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 350,
                temperature: 0.7
            })
        });

        const data = await response.json();
        console.log('OpenAI API response:', data);

        if (data.choices && data.choices.length > 0) {
            res.status(200).json(data);
        } else {
            console.error('Invalid response structure:', data);
            res.status(500).json({ error: 'Invalid response from OpenAI' });
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Error communicating with OpenAI API' });
    }
}
