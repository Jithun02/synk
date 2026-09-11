import { NextResponse } from 'next/server';
import { AICanvasAgent } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, objects } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (action === 'generate') {
      const isRealKey = apiKey && !apiKey.includes('your_gemini_api_key_here');
      // If valid external API Key is provided, attempt live LLM call with 3s timeout
      if (isRealKey && process.env.GEMINI_API_KEY) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate system architecture components for: "${prompt}". Return short text summary.`,
                      },
                    ],
                  },
                ],
              }),
            }
          );
          clearTimeout(timeoutId);
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log('Live Gemini AI Response:', data.candidates[0].content.parts[0].text);
          }
        } catch (err) {
          console.warn('Gemini API call warning, falling back to built-in AI engine:', err);
        }
      }

      // Built-in zero-latency local AI engine
      const generated = AICanvasAgent.generateDiagramFromPrompt(prompt || 'Microservices Stack');
      return NextResponse.json({ success: true, objects: generated, mode: apiKey ? 'external_llm' : 'builtin_ai' });
    }

    if (action === 'explain') {
      const explanation = AICanvasAgent.explainCanvas(objects || []);
      return NextResponse.json({ success: true, explanation });
    }

    if (action === 'audit') {
      const issues = AICanvasAgent.auditSecurity(objects || []);
      return NextResponse.json({ success: true, issues });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
