"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { HTMLAttributes, useContext, useRef, useState } from "react";
import { toast } from "react-hot-toast";
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
    mutationKey: ["sendMessage"],
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      });

      if (!response.ok) {
        throw new Error();
      }

      return response.body;
    },
    onMutate: (message) => {
      addMessage(message);
    },
    onSuccess: async (stream) => {
      if (!stream)
        throw new Error("No readable stream was received from OpenAI.");

      // Construct a new message to add
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
      setInput("");

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    },
    onError(_, message) {
      toast.error("Something went wrong. Please try again!");
      removeMessage(message.id);

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
          disabled={isLoading}
          autoFocus
          placeholder='Write a message...'
          className='peer disabled:opacity-50 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch pr-14'
        />

        <div className='absolute flex inset-y-0 right-0 py-1.5 pr-1.5'>
          <kbd className='inline-flex self-end items-center rounded border bg-white border-gray-200 font-sans text-xs text-gray-400 p-1'>
            {isLoading ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              <CornerDownLeft className='h-3 w-3' />
            )}
          </kbd>
        </div>

        <div
          aria-hidden='true'
          className='absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600'
        />
      </div>
    </div>
  );
};

export default Input;
