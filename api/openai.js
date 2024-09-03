export default async function handler(req, res) {
    console.log('Request Body:', req.body);
    const prompt = req.body.prompt;

    if (!prompt) {
        console.error('Prompt is null or empty');
        return res.status(400).json({ error: 'Prompt cannot be null or empty' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({ prompt: prompt })
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
