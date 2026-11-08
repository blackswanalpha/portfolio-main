"use client";

import { Box, Flex, HStack, Text, VisuallyHidden } from "@chakra-ui/react";
import { useLayoutEffect, useRef } from "react";
import { ErrorState } from "@/components/ui/states";
import type { ChatMessage } from "./useAIChat";

interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  /** The last user message has no reply and nothing is in flight. */
  unanswered: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Distance from the bottom (px) within which new messages keep the view pinned. */
const STICK_THRESHOLD = 48;

function formatContent(content: string) {
  return content.split(/\r?\n/).map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "") return <Box key={idx} h={2} />;
    return (
      <Text as="span" display="block" key={idx} pl={trimmed.startsWith("• ") ? 2 : 0}>
        {trimmed.startsWith("• ") ? trimmed : line}
      </Text>
    );
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} px={4}>
      <Box
        maxW="85%"
        px={3}
        py={2}
        rounded="xl"
        roundedBottomRight={isUser ? "sm" : "xl"}
        roundedBottomLeft={isUser ? "xl" : "sm"}
        bg={isUser ? "primary.500" : "background"}
        color={isUser ? "white" : "text.primary"}
        fontSize="sm"
        lineHeight="1.55"
        overflowWrap="anywhere"
      >
        <VisuallyHidden>{isUser ? "You: " : "Victor AI: "}</VisuallyHidden>
        {formatContent(message.content)}
      </Box>
    </Flex>
  );
}

function TypingIndicator() {
  return (
    <Flex px={4}>
      <VisuallyHidden>Victor AI is typing</VisuallyHidden>
      <HStack gap={1} px={3} py={3} rounded="xl" roundedBottomLeft="sm" bg="background" aria-hidden>
        <Box className="ai-typing-dot" boxSize={1.5} rounded="full" bg="text.muted" />
        <Box className="ai-typing-dot" boxSize={1.5} rounded="full" bg="text.muted" />
        <Box className="ai-typing-dot" boxSize={1.5} rounded="full" bg="text.muted" />
      </HStack>
    </Flex>
  );
}

export default function MessageList({
  messages,
  pending,
  unanswered,
  error,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Follow new messages only while the reader is at (or near) the bottom, so
  // scrolling back through history is not yanked away by a reply.
  const stickRef = useRef(true);
  const lastRole = messages[messages.length - 1]?.role;

  // Layout effect: one read and one write before paint, so the list never
  // paints at the old position first.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (lastRole === "user") stickRef.current = true; // the reader's own message
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, lastRole, pending, unanswered]);

  return (
    <Box
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label="Conversation"
      tabIndex={0}
      flex={1}
      minH={0}
      overflowY="auto"
      overscrollBehavior="contain"
      py={4}
      className="chat-scroll"
      onScroll={(e) => {
        const el = e.currentTarget;
        stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
      }}
    >
      <Flex direction="column" gap={3}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {pending && <TypingIndicator />}
        {unanswered && (
          <Box px={4}>
            <ErrorState
              compact
              title="No reply"
              description={error ?? "This message didn't get a reply."}
              onRetry={onRetry}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
}
