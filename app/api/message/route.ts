import { MessageArraySchema } from "@/lib/validators/message";
import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";

import {
  GPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/openai-stream";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const parsedMessages = MessageArraySchema.parse(messages);

  const outboundMessages: GPTMessage[] = parsedMessages.map((message) => ({
    role: message.isUserMessage ? "user" : "system",
    content: message.text,
  }));

  outboundMessages.unshift({
    role: "system",
    content: chatbotPrompt,
  });

  const payload: OpenAIStreamPayload = {
    model: "gpt-4o",
    messages: outboundMessages,
    temperature: 0.4,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 150,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  return new Response(stream);
}
