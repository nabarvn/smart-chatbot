import { z } from "zod";

// Message validator
export const MessageSchema = z.object({
  id: z.string(),
  isUserMessage: z.boolean(),
  text: z.string(),
});

// Array validator
export const MessageArraySchema = z.array(MessageSchema);

// Message type
export type Message = z.infer<typeof MessageSchema>;
