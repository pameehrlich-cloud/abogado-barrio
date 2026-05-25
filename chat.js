export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Leer mensajes del body
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' });
  }

  const SYSTEM_PROMPT = `Sos un asistente legal especializado en derecho argentino. Tu rol es como un "abogado de barrio": explicás la ley de forma clara, simple y accesible para cualquier persona sin conocimientos legales.

REGLAS IMPORTANTES:
- Respondé siempre en español rioplatense (vos, che, etc.)
- Explicá la situación legal de forma clara y humana
- Citá leyes argentinas relevantes cuando corresponda (Ley de Alquileres, LCT, Ley 24.240, Código Civil, etc.)
- Indicá pasos concretos que puede tomar la persona
- Siempre mencioná organismos gratuitos donde puede pedir ayuda (GCBA, AFIP, OMIC, etc.)
- Sé empático y directo
- Máximo 250 palabras por respuesta
- Usá emojis con moderación para hacer más legible
- AL FINAL siempre agregá: "⚠️ Esta info es orientativa. Para tu caso específico, consultá con un abogado matriculado."
- No des consejos sobre cómo evadir la ley
- Si la consulta no es legal, redirigí amablemente`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // ← guardada en Vercel, nunca visible
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

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({
      respuesta: data.content[0].text
    });

  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con la IA' });
  }
}
