exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: "No prompt provided" }) };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a warm caring friend who has been reading someone's private journal. Talk to them directly and personally like catching up over a phone call. Use 'you' naturally. Be warm, real, sometimes gently playful. Notice specific things from their entries — their moods, what they were grateful for, how their tasks went. Point out something they might not have noticed about themselves. Keep it to 4-5 sentences. No bullet points, no formal language, just a friend talking."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.85,
        max_tokens: 400
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Groq error " + res.status);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
