"use client";

import { Box, Flex, HStack, IconButton, Text, Textarea, chakra } from "@chakra-ui/react";
import { motion, useIsPresent } from "framer-motion";
import { LuMessageCircle, LuSend, LuTrash2, LuX } from "react-icons/lu";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import MessageList from "./MessageList";
import { useAIChat } from "./useAIChat";
import { MAX_MESSAGE_LENGTH } from "./limits";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollLock } from "@/lib/scrollLock";

const MotionBox = motion.create(Box);

const SUGGESTIONS = [
  "What tech do you use?",
  "Show me recent projects",
  "Tell me about your experience",
  "How do I contact you?",
];

const FOCUSABLE =
  'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Show the character count once the message is this close to the limit. */
const COUNTER_FROM = MAX_MESSAGE_LENGTH - 100;

interface ChatPanelProps {
  id: string;
  /** `restoreFocus` is true when focus was inside the panel, so the launcher takes it back. */
  onClose: (restoreFocus: boolean) => void;
}

export default function ChatPanel({ id, onClose }: ChatPanelProps) {
  const { messages, pending, error, unanswered, sendMessage, retry, abort, clear } = useAIChat();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const counterId = useId();

  // False while the close animation runs: from that moment the request is
  // aborted, the scroll lock is released and Escape is no longer handled.
  const isPresent = useIsPresent();

  // Below md the panel is full screen: it is modal there (scroll lock, focus
  // trap). Above md it is a non-modal window beside the page.
  const isMobile = useMediaQuery("(max-width: 47.9rem)");
  useScrollLock(isPresent && isMobile);

  useEffect(() => {
    if (!isPresent) abort();
  }, [isPresent, abort]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isPresent) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      onClose(panelRef.current?.contains(document.activeElement) ?? false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresent, onClose]);

  const canSend = input.trim().length > 0 && !pending;

  const handleSend = () => {
    if (!canSend) return;
    if (sendMessage(input)) setInput("");
    inputRef.current?.focus(); // the send button disables itself; keep focus in the panel
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    if (pending) return;
    sendMessage(text);
    inputRef.current?.focus();
  };

  // Keep Tab inside the panel while it is modal (full screen on small screens).
  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !isMobile) return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const activeEl = document.activeElement;
    if (event.shiftKey && (activeEl === first || !panel.contains(activeEl))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <MotionBox
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal={isMobile ? true : undefined}
      aria-labelledby={titleId}
      onKeyDown={handlePanelKeyDown}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      position="fixed"
      bottom={{ base: 0, md: "96px" }}
      right={{ base: 0, md: "24px" }}
      left={{ base: 0, md: "auto" }}
      width={{ base: "auto", md: "380px" }}
      height={{ base: "100dvh", md: "560px" }}
      maxHeight={{ base: "100dvh", md: "calc(100dvh - 120px)" }}
      zIndex={60}
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="surface"
      borderWidth={{ base: 0, md: "1px" }}
      borderColor="border"
      borderRadius={{ base: 0, md: "xl" }}
      boxShadow={{ base: "none", md: "0 12px 32px -8px rgba(15, 23, 42, 0.18)" }}
    >
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="border"
      >
        <HStack gap={3}>
          <Flex
            align="center"
            justify="center"
            boxSize={8}
            rounded="md"
            bg="background"
            color="text.secondary"
            aria-hidden
          >
            <LuMessageCircle size={16} />
          </Flex>
          <Box>
            <Text id={titleId} textStyle="label" color="text.primary">
              Victor AI
            </Text>
            <Text fontSize="xs" color="text.muted">
              Answers from this portfolio
            </Text>
          </Box>
        </HStack>
        <HStack gap={1}>
          <IconButton
            aria-label="Clear conversation"
            size="sm"
            variant="ghost"
            color="text.muted"
            _hover={{ color: "text.primary", bg: "background" }}
            onClick={clear}
          >
            <LuTrash2 size={16} />
          </IconButton>
          <IconButton
            aria-label="Close chat"
            size="sm"
            variant="ghost"
            color="text.muted"
            _hover={{ color: "text.primary", bg: "background" }}
            onClick={() => onClose(true)}
          >
            <LuX size={16} />
          </IconButton>
        </HStack>
      </Flex>

      <Flex
        gap={2}
        px={4}
        py={2}
        overflowX="auto"
        className="chat-scroll"
        borderBottomWidth="1px"
        borderColor="border"
        flexShrink={0}
      >
        {SUGGESTIONS.map((label) => (
          <chakra.button
            key={label}
            type="button"
            onClick={() => handleSuggestion(label)}
            disabled={pending}
            px={3}
            py={1}
            rounded="md"
            bg="background"
            color="text.secondary"
            fontSize="xs"
            fontWeight="medium"
            whiteSpace="nowrap"
            borderWidth="1px"
            borderColor="border"
            cursor="pointer"
            transition="background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease"
            _hover={{ borderColor: "primary.500", color: "primary.600" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            {label}
          </chakra.button>
        ))}
      </Flex>

      <MessageList
        messages={messages}
        pending={pending}
        unanswered={unanswered}
        error={error}
        onRetry={() => {
          retry();
          inputRef.current?.focus(); // the retry button unmounts once the request starts
        }}
      />

      <Box px={3} py={3} borderTopWidth="1px" borderColor="border" flexShrink={0}>
        <HStack
          align="flex-end"
          gap={2}
          bg="surface"
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          px={3}
          py={2}
          transition="border-color 0.15s ease, box-shadow 0.15s ease"
          _focusWithin={{
            borderColor: "primary.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)",
          }}
        >
          <Textarea
            ref={inputRef}
            aria-label="Message"
            aria-describedby={input.length >= COUNTER_FROM ? counterId : undefined}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Ask a question"
            rows={1}
            minH="36px"
            maxH="120px"
            resize="none"
            variant="flushed"
            border="none"
            _focus={{ boxShadow: "none", border: "none" }}
            _focusVisible={{ outline: "none" }}
            flex={1}
            fontSize="sm"
            color="text.primary"
          />
          <IconButton
            aria-label="Send message"
            size="sm"
            rounded="md"
            bg="primary.500"
            color="white"
            _hover={{ bg: "primary.600" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
            transition="background-color 0.15s ease"
            disabled={!canSend}
            onClick={handleSend}
          >
            <LuSend size={16} />
          </IconButton>
        </HStack>
        {input.length >= COUNTER_FROM && (
          <Text
            id={counterId}
            fontSize="xs"
            color={input.length >= MAX_MESSAGE_LENGTH ? "red.700" : "text.muted"}
            textAlign="right"
            mt={1}
            fontVariantNumeric="tabular-nums"
          >
            {input.length}/{MAX_MESSAGE_LENGTH} characters
          </Text>
        )}
      </Box>
    </MotionBox>
  );
}
