const https = require('https');

module.exports = async (req, res) => {
    const { prompt } = req.body;

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7
    });

    const apiReq = https.request(options, (apiRes) => {
        let responseData = '';

        apiRes.on('data', (chunk) => {
            responseData += chunk;
        });

        apiRes.on('end', () => {
            try {
                const jsonResponse = JSON.parse(responseData);  // Tenta analisar o JSON
                res.status(200).json(jsonResponse);
            } catch (error) {
                console.error('Error parsing JSON response:', error);
                res.status(500).json({ error: 'Failed to parse JSON from OpenAI', details: error.message });
            }
        });
    });

    apiReq.on('error', (error) => {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({
            error: 'Failed to fetch from OpenAI API',
            details: error.message
        });
    });

    apiReq.write(data);
    apiReq.end();
};
