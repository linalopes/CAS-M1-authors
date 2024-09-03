export default async function handler(req, res) {
    const prompt = req.body.prompt;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`  // The key is safe here
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',  // or 'gpt-4' if you want to use the GPT-4 model
            messages: [
                { role: "system", content: "You are a creative assistant that helps generate rap battle verses between important authors in the field of AI and machine learning. These authors are from different times, places, and background studies." },
                { role: "user", content: prompt }
            ],
            max_tokens: 350,
            temperature: 0.7
        })
    });

    const data = await response.json();
    res.status(200).json(data);
}
