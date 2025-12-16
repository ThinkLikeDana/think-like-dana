import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `PASTE YOUR THINK LIKE DANA SYSTEM PROMPT HERE`;

export async function POST(req: NextRequest) {
try {
const { mode, raw_prompt, context } = await req.json();

if (!raw_prompt || raw_prompt.length < 10) {
return NextResponse.json({ error: "Prompt too short." }, { status: 400 });
}

let userContent = `MODE: ${mode}\n\nRAW PROMPT:\n${raw_prompt}`;

if (mode === "DETAIL" && context) {
userContent += `\n\nOPTIONAL CONTEXT:`;
if (context.audience) userContent += `\nAudience: ${context.audience}`;
if (context.tone) userContent += `\nTone: ${context.tone}`;
if (context.output_format) userContent += `\nOutput Format: ${context.output_format}`;
}

const response = await fetch("https://api.openai.com/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model: "gpt-4.1",
temperature: 0.2,
max_tokens: 900,
messages: [
{ role: "system", content: SYSTEM_PROMPT },
{ role: "user", content: userContent }
]
  })
});

const data = await response.json();
const content = data.choices?.[0]?.message?.content;

if (!content) throw new Error("No response");

return NextResponse.json({ result: content });
} catch {
return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}
