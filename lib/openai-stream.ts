import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";

export type GPTAgent = "user" | "system";

export interface GPTMessage {
  role: GPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: GPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            // Closing the readable stream
            controller.close();

            return;
          }

          try {
            // json to text
            const jsonData = JSON.parse(data);
            const text = jsonData.choices[0].delta?.content || "";

            // If there is a newline character
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            // Create a queue and then enqueue it
            const queue = encoder.encode(text);
            controller.enqueue(queue);

            counter++;
          } catch (err) {
            controller.error(err);
          }
        }
      }

      const parser = createParser(onParse);

      for await (const chunk of response.body as any) {
        // Feeding the chunk of response that we get back from OpenAI to the parser
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
