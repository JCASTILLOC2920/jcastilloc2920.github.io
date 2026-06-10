export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemPrompt, knowledgeBase } = req.body;

  try {
    // Usamos OpenRouter (Modelos Gratuitos) para costo CERO absoluto
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`, // Su llave de OpenRouter
        'HTTP-Referer': 'https://jcpathlab.com',
        'X-Title': 'Victoria AI - JC PATH LAB'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
        messages: [
          { role: 'system', content: `${systemPrompt}\nBase de conocimientos: ${knowledgeBase}` },
          { role: 'user', content: message }
        ],
        temperature: 0.5,
        max_tokens: 400
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en API Chat:', error);
    return res.status(500).json({ error: 'Falla en la red de la colmena' });
  }
}
