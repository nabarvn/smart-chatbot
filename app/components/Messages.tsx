"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useContext } from "react";
import MarkdownLite from "./MarkdownLite";

interface MessagesProps extends HTMLAttributes<HTMLDivElement> {}

const Messages = ({ className, ...props }: MessagesProps) => {
  const { messages } = useContext(MessagesContext);

  // Reversing the order of messages so that `flex-col-reverse` gives us the desired order of messages from bottom-up
  const inverseMessages = [...messages].reverse();

  return (
    <div
      {...props}
      className={cn(
        "flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch",
        className
      )}
    >
      <div className='flex-1 flex-grow' />

      {inverseMessages.map((message) => (
        <div key={message.id} className='chat-message'>
          <div
            className={cn("flex items-end", {
              "justify-end": message.isUserMessage,
            })}
          >
            <div
              className={cn(
                "flex flex-col text-sm space-y-2 max-w-xs overflow-x-hidden mx-2",
                {
                  // "bg-blue-600 text-white": message.isUserMessage,
                  // "bg-gray-200 text-gray-900": !message.isUserMessage,
                }
              )}
            >
              {/* <MarkdownLite text={message.text} /> */}
              {message.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
