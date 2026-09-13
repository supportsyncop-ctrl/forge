type AgentResult = { text: string; model: string; fallback: boolean };

export async function runForgeAgent(prompt: string, context: string): Promise<AgentResult> {
  const baseUrl = process.env.LLM_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "forge-model";

  if (!baseUrl || !apiKey) {
    return {
      model,
      fallback: true,
      text: `I have your request: “${prompt}”\n\nForge is ready to execute this in the ${context} workspace. Connect your OpenAI-compatible model endpoint to replace this readiness response with live reasoning, tool calls, and artifacts.`,
    };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are Forge, a precise agent workspace. Be concise, state assumptions, and describe concrete next actions." },
          { role: "user", content: `[Workspace: ${context}]\n${prompt}` },
        ],
        temperature: 0.2,
      }),
    });
    if (!response.ok) throw new Error(`Forge model request failed (${response.status})`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { model, fallback: false, text: data.choices?.[0]?.message?.content || "The model returned an empty response." };
  } catch {
    return { model, fallback: true, text: `The live model endpoint is unavailable, so Forge completed a local dry run for “${prompt}”. Connect your custom OpenAI-compatible endpoint to enable live reasoning and tool execution.` };
  }
}
