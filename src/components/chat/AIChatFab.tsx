"use client";

import { Box, Text, chakra } from "@chakra-ui/react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { LuMessageCircle, LuX } from "react-icons/lu";
import { useCallback, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ChatPanel from "./ChatPanel";

const MotionBox = motion.create(Box);

export default function AIChatFab() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // Each open mounts a fresh panel, so a panel that is still animating out
  // (and has aborted its request) is never reused.
  const [openCount, setOpenCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [openPath, setOpenPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Navigating closes the panel (adjusting state while rendering, no effect):
  // its request is aborted and its scroll lock released.
  if (openPath !== pathname) {
    setOpenPath(pathname);
    setIsOpen(false);
  }

  const close = useCallback((restoreFocus: boolean) => {
    setIsOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setOpenCount((n) => n + 1);
      setIsOpen(true);
      setShowHint(false);
    }
  };

  // The public-facing chat has no place over the admin portal or login.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <MotionConfig reducedMotion="user">
      <Box
        position="fixed"
        bottom={{ base: 5, md: 6 }}
        right={{ base: 5, md: 6 }}
        zIndex={60}
      >
        <Box
          position="absolute"
          right="calc(100% + 12px)"
          top={0}
          bottom={0}
          display="flex"
          alignItems="center"
          pointerEvents="none"
          aria-hidden
        >
          <AnimatePresence>
            {!isOpen && showHint && (
              <MotionBox
                key="hint"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                bg="surface"
                borderWidth="1px"
                borderColor="border"
                px={3}
                py={1.5}
                rounded="md"
                boxShadow="0 2px 8px rgba(15, 23, 42, 0.08)"
                whiteSpace="nowrap"
              >
                <Text textStyle="label" color="text.primary">
                  Ask Victor AI
                </Text>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        <chakra.button
          ref={buttonRef}
          type="button"
          aria-label={isOpen ? "Close chat" : "Open chat"}
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          onClick={toggle}
          onPointerEnter={() => setShowHint(true)}
          onPointerLeave={() => setShowHint(false)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize={{ base: 12, md: 14 }}
          rounded="md"
          bg="primary.500"
          color="white"
          border="none"
          cursor="pointer"
          boxShadow="0 2px 8px rgba(15, 23, 42, 0.16)"
          transition="background-color 0.15s ease, transform 0.1s ease"
          _hover={{ bg: "primary.600" }}
          _active={{ transform: "scale(0.96)" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "primary.500",
            outlineOffset: "3px",
          }}
        >
          {isOpen ? <LuX size={22} aria-hidden /> : <LuMessageCircle size={22} aria-hidden />}
        </chakra.button>
      </Box>

      <AnimatePresence>
        {isOpen && <ChatPanel key={`chat-${openCount}`} id={panelId} onClose={close} />}
      </AnimatePresence>
    </MotionConfig>
  );
}
