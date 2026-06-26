// Vercel serverless function — keeps the Anthropic API key on the server.
// The key is read from the ANTHROPIC_API_KEY environment variable and is
// NEVER exposed to the browser. The client only sends { system, messages }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server not configured: ANTHROPIC_API_KEY is missing." });
  }

  try {
    const { system, messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "`messages` array is required." });
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: typeof system === "string" ? system : "",
        messages,
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
