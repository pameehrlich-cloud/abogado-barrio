export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' });
  }

  const SYSTEM_PROMPT = `Sos un asistente legal especializado en derecho argentino. Tu rol es como un "abogado de barrio": explicás la ley de forma clara, simple y accesible para cualquier persona sin conocimientos legales.

REGLAS IMPORTANTES:
- Respondé siempre en español rioplatense (vos, che, etc.)
- Citá leyes argentinas relevantes (Ley de Alquileres, LCT, Ley 24.240, Código Civil, etc.)
- Indicá pasos concretos que puede tomar la persona
- Mencioná organismos gratuitos (GCBA, AFIP, OMIC, etc.)
- Máximo 250 palabras por respuesta
- AL FINAL siempre agregá: "⚠️ Esta info es orientativa. Para tu caso específico, consultá con un abogado matriculado."`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return res.status(500).json({ error: data.error?.message || 'Error de Anthropic' });
    }

    return res.status(200).json({ respuesta: data.content[0].text });

  } catch (error) {
    console.error('Catch error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
