import { NextResponse } from "next/server";
import { portfolioContext } from "@/components/chat/portfolioContext";
import {
  MAX_CONTEXT_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_MESSAGES,
} from "@/components/chat/limits";

// Local keyword matcher over portfolioContext. No external API is called.

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const MAX_BODY_BYTES = 64 * 1024;

const FALLBACK =
  "I'm not 100% sure I caught that. You can ask me about Victor's skills, projects, experience, rates, or how to get in touch - or use the quick chips above.";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Word-aware matching. `has` matches terms at the start of a word ("skill"
 * matches "skills"), `hasWord` only whole words. Plain substring matching sent
 * "Is he available for hire?" to the greeting ("hi" inside "hire") and
 * "Are you available for freelance?" to the AI answer ("ai" inside "available").
 */
function matcher(text: string) {
  const startsWord = (term: string) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}`).test(text);
  const wholeWord = (term: string) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}($|[^a-z0-9])`).test(text);
  return {
    has: (...terms: string[]) => terms.some(startsWord),
    hasWord: (...terms: string[]) => terms.some(wholeWord),
  };
}

function pickReply(input: string): string {
  const { has, hasWord } = matcher(input.toLowerCase().trim());

  if (has("contact", "email", "reach", "hire", "hiring", "talk", "work with", "get in touch")) {
    const links = portfolioContext.contact.links
      .map((l) => `${l.label} (${l.handle})`)
      .join(", ");
    return `You can reach Victor at ${portfolioContext.contact.email} or via ${links}. He's based in ${portfolioContext.contact.location} and is ${portfolioContext.status.toLowerCase()} - lead time is usually around 2 weeks.`;
  }

  if (has("rate", "price", "pricing", "cost", "budget", "fee", "charge")) {
    return `${portfolioContext.faq[1].a} For a tailored quote, send the project details via the contact form or email ${portfolioContext.contact.email}.`;
  }

  if (has("available", "availability", "freelance")) {
    return portfolioContext.faq[0].a;
  }

  if (has("skill", "tech", "stack", "language", "framework", "tool")) {
    return `Victor works primarily with: ${portfolioContext.skills.join(", ")}. He leans on Next.js + TypeScript for web apps, Three.js for 3D experiences, and Chakra UI / Tailwind for design systems.`;
  }

  if (has("project", "portfolio", "work", "built", "shipped", "case stud")) {
    const list = portfolioContext.projects
      .map((p) => `• ${p.name} - ${p.description}`)
      .join("\n");
    return `Here are a few highlights from his portfolio:\n\n${list}\n\nWant the deep dive on any of these?`;
  }

  if (
    has("experience", "career", "history", "years", "background", "about") ||
    hasWord("job", "bio", "who")
  ) {
    const list = portfolioContext.experience
      .map((e) => `• ${e.role} @ ${e.company} (${e.period}) - ${e.summary}`)
      .join("\n");
    return `${portfolioContext.bio}\n\nExperience snapshot:\n${list}`;
  }

  if (has("design", "figma") || hasWord("ui", "ux")) {
    return `Victor designs in Figma and ships production interfaces in Chakra UI and Tailwind. Recent work includes the Luxe Fashion Store redesign and the Nova Financial dashboard.`;
  }

  if (has("chat", "openai") || hasWord("ai", "gpt", "llm")) {
    return `Yes - the Cogni Chat project is Victor's flagship AI interface work. He's comfortable integrating OpenAI / Gemini, prompt design, and building polished chat UX.`;
  }

  if (has("location", "nairobi", "kenya", "remote", "timezone")) {
    return `Victor is based in ${portfolioContext.contact.location} and works comfortably with clients in EU and US timezones.`;
  }

  if (has("resume", "download") || hasWord("cv")) {
    // The site has no CV download (the old reply pointed to a "Download CV"
    // button that does not exist), so point to the contact email instead.
    return `There's no CV download on the site. You can ask Victor for one at ${portfolioContext.contact.email}, or ask me for a quick summary of his experience.`;
  }

  if (has("faq", "question") || hasWord("ask")) {
    return portfolioContext.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  }

  if (has("thank", "awesome", "great", "cool")) {
    return `Anytime! If you'd like to take the next step, drop Victor a note at ${portfolioContext.contact.email}.`;
  }

  if (hasWord("bye", "goodbye") || has("see you")) {
    return `Cheers! Don't hesitate to come back if you have more questions.`;
  }

  // Greetings last, so "Hi, what's your rate?" answers the question.
  if (hasWord("hello", "hi", "hey", "greetings")) {
    return `Hi there! I'm Victor's portfolio assistant. Want to know about his skills, recent projects, or how to hire him?`;
  }

  return FALLBACK;
}

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** The last user message of a valid conversation, or a readable error for the UI. */
function parseLastUserMessage(body: unknown): { text: string } | string {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    return "Send the conversation as { messages: [{ role, content }] }.";
  }
  const raw = (body as { messages: unknown[] }).messages;
  if (raw.length === 0) return "Type a message first.";
  if (raw.length > MAX_REQUEST_MESSAGES) {
    return `Send at most ${MAX_REQUEST_MESSAGES} messages at a time.`;
  }

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    const m = item as { role?: unknown; content?: unknown } | null;
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return "Each message needs a role (user or assistant) and text content.";
    }
    if (m.content.length > MAX_CONTEXT_MESSAGE_LENGTH) {
      return "A message in the conversation is too long.";
    }
    if (m.role === "user" && m.content.length > MAX_MESSAGE_LENGTH) {
      return `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`;
    }
    messages.push({ role: m.role, content: m.content });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser || !lastUser.content.trim()) return "Type a message first.";
  return { text: lastUser.content };
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return badRequest("The conversation is too long to send. Clear it and ask again.", 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return badRequest("The request body couldn't be read.");
  }
  if (raw.length > MAX_BODY_BYTES) {
    return badRequest("The conversation is too long to send. Clear it and ask again.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest("The request wasn't valid JSON.");
  }

  const parsed = parseLastUserMessage(body);
  if (typeof parsed === "string") return badRequest(parsed);

  const reply = pickReply(parsed.text);

  await new Promise((resolve) => setTimeout(resolve, 350));

  return NextResponse.json({
    reply,
    role: "assistant" as const,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST { messages: [{ role, content }] }",
  });
}
