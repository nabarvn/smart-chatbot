"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { HTMLAttributes, useContext, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface InputProps extends HTMLAttributes<HTMLDivElement> {}

const Input = ({ className, ...props }: InputProps) => {
  const [input, setInput] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    messages,
    isMessageUpdating,
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext);

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      });

      return response.body;
    },
    onMutate: (message) => {
      setInput("");
      addMessage(message);
    },
    onSuccess: async (stream) => {
      if (!stream)
        throw new Error("No readable stream was received from OpenAI.");

      const id = nanoid();
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: "",
      };

      addMessage(responseMessage);
      setIsMessageUpdating(true);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        // Converting the stream value into regular string text
        const chunkValue = decoder.decode(value);

        updateMessage(id, (prev) => prev + chunkValue);
      }

      // Clean up
      setIsMessageUpdating(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    },
  });

  return (
    <div {...props} className={cn("border-t border-zinc-300", className)}>
      <div className='relative flex-1 overflow-hidden rounded-lg border-none outline-none mt-4'>
        <TextareaAutosize
          ref={textareaRef}
          rows={2}
          maxRows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              const message = {
                id: nanoid(),
                isUserMessage: true,
                text: input,
              };

              sendMessage(message);
            }
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          placeholder='Write a message...'
          className='peer disabled:opacity-50 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 pr-14'
        />
      </div>
    </div>
  );
};

export default Input;
