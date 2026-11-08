"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
  chakra,
  type ButtonProps,
} from "@chakra-ui/react";
import { useEffect, useRef, type ReactNode, type Ref, type RefObject } from "react";
import { LuLock, LuPlay, LuStar, LuVolume2, LuVolumeX } from "react-icons/lu";
import { setSoundEnabled } from "@/lib/arcade/sound";
import { STAGE_BG } from "./fx";
import { useMountGuard, useSoundEnabled } from "./hooks";

// DOM chrome shared by the arcade games. It follows the site conventions
// (6px radius, theme text styles, lucide icons, no glow); the colour lives on
// the dark stage and inside the canvases.

export interface HudStat {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

function Stat({ label, value, highlight }: HudStat) {
  return (
    <VStack gap={0} align="center" minW="11">
      <Text
        fontSize="lg"
        fontWeight="semibold"
        lineHeight="1.1"
        fontVariantNumeric="tabular-nums"
        color={highlight ? "primary.600" : "text.primary"}
      >
        {value}
      </Text>
      <Text fontSize="xs" color="text.muted">
        {label}
      </Text>
    </VStack>
  );
}

export function ArcadeHud({
  title,
  subtitle,
  stats,
  actions,
}: {
  title: string;
  subtitle?: string;
  stats: HudStat[];
  actions?: ReactNode;
}) {
  return (
    <Flex
      bg="surface"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      px={{ base: 4, md: 5 }}
      py={3}
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
      w="full"
    >
      <Box minW={0}>
        <Heading as="h2" textStyle="cardTitle" color="text.primary" lineClamp={1}>
          {title}
        </Heading>
        {subtitle ? (
          <Text textStyle="meta" color="text.muted">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <HStack gap={{ base: 3, md: 5 }}>
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </HStack>
      {actions ? <HStack gap={2}>{actions}</HStack> : null}
    </Flex>
  );
}

export function HudButton(props: ButtonProps) {
  return <Button size="sm" variant="outline" gap={1.5} {...props} />;
}

export function SoundToggle() {
  const enabled = useSoundEnabled();
  return (
    <IconButton
      size="sm"
      variant="outline"
      aria-label="Sound"
      aria-pressed={enabled}
      title={enabled ? "Sound on" : "Sound off"}
      onClick={() => setSoundEnabled(!enabled)}
    >
      {enabled ? <LuVolume2 aria-hidden /> : <LuVolumeX aria-hidden />}
    </IconButton>
  );
}

/**
 * The dark stage a game canvas sits on. The inner box keeps the canvas aspect
 * ratio before the first measure, so nothing shifts while the game loads.
 */
export function Stage({
  aspect,
  maxW,
  children,
  overlay,
  ref,
}: {
  aspect: number;
  maxW: string;
  children: ReactNode;
  overlay?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <Box
      bg={STAGE_BG}
      rounded="md"
      w="full"
      px={{ base: 2, sm: 4, md: 6 }}
      py={{ base: 3, sm: 5, md: 6 }}
      display="flex"
      justifyContent="center"
    >
      <Box
        ref={ref}
        position="relative"
        w="full"
        maxW={maxW}
        // Clear the fixed navbar when a game scrolls its field into view.
        scrollMarginTop={{ base: "96px", md: "112px" }}
        scrollMarginBottom="24px"
        style={{ aspectRatio: String(aspect) }}
      >
        {children}
        {overlay}
      </Box>
    </Box>
  );
}

/** Stars on the dark stage (amber filled, faint empty). */
export function StageStars({ n, size = 26 }: { n: number; size?: number }) {
  return (
    <HStack gap={1} role="img" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <Box key={i} as="span" lineHeight={0} color={i <= n ? "#fbbf24" : "whiteAlpha.300"}>
          <LuStar size={size} strokeWidth={1.5} fill={i <= n ? "currentColor" : "none"} aria-hidden />
        </Box>
      ))}
    </HStack>
  );
}

/**
 * Message layer over the stage (start, pause, result). Not a modal: it sits
 * inside the game region. When `autoFocus` is set (results reached by play),
 * focus moves to the first button so Enter continues.
 */
export function StageOverlay({
  title,
  children,
  actions,
  autoFocus = false,
  live = true,
}: {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  autoFocus?: boolean;
  live?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!autoFocus) return;
    ref.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
  }, [autoFocus]);
  // A light dim keeps the board (the lit grid, the final bricks) visible
  // around a solid card that carries the text.
  return (
    <Flex
      position="absolute"
      inset={0}
      zIndex={1}
      align="center"
      justify="center"
      p={{ base: 2, md: 6 }}
      bg="rgba(7, 10, 20, 0.45)"
      rounded="md"
      _motionSafe={{ animationName: "fade-in", animationDuration: "0.2s" }}
    >
      <Flex
        ref={ref}
        direction="column"
        align="center"
        gap={{ base: 3, md: 4 }}
        w="full"
        maxW="md"
        px={{ base: 4, md: 7 }}
        py={{ base: 5, md: 7 }}
        textAlign="center"
        bg="rgba(10, 14, 26, 0.94)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        rounded="md"
        role="group"
        aria-label={title}
        aria-live={live ? "polite" : undefined}
      >
        <Heading as="h3" textStyle="sectionTitle" color="white">
          {title}
        </Heading>
        {children}
        {actions ? (
          <Flex gap={2} wrap="wrap" justify="center" pt={1}>
            {actions}
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}

export function StagePrimaryButton(props: ButtonProps) {
  return (
    <Button
      size="md"
      gap={1.5}
      bg="primary.500"
      color="white"
      _hover={{ bg: "primary.600" }}
      {...props}
    />
  );
}

export function StageSecondaryButton(props: ButtonProps) {
  return (
    <Button
      size="md"
      gap={1.5}
      variant="outline"
      color="whiteAlpha.900"
      borderColor="whiteAlpha.400"
      _hover={{ bg: "whiteAlpha.100" }}
      {...props}
    />
  );
}

export function StageText({ children }: { children: ReactNode }) {
  return (
    <Text textStyle="body" color="whiteAlpha.800" maxW="sm">
      {children}
    </Text>
  );
}

export interface LevelTile {
  id: number;
  name: string;
  locked: boolean;
  stars: number;
  meta: string;
  next?: boolean;
}

/** Compact level picker (light theme, like the Sokoban level select). */
export function LevelGrid({
  title,
  description,
  levels,
  onSelect,
  headingRef,
}: {
  title: string;
  description: string;
  levels: LevelTile[];
  onSelect: (id: number) => void;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  const justMounted = useMountGuard();
  return (
    <VStack gap={5} w="full" align="stretch">
      <Box>
        <Heading
          ref={headingRef}
          tabIndex={-1}
          as="h2"
          textStyle="sectionTitle"
          color="text.primary"
          mb={1}
          _focus={{ outline: "none" }}
        >
          {title}
        </Heading>
        <Text textStyle="body" color="text.secondary">
          {description}
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={{ base: 3, md: 4 }}>
        {levels.map((lvl) => (
          <chakra.button
            key={lvl.id}
            type="button"
            disabled={lvl.locked}
            onClick={() => {
              if (!justMounted()) onSelect(lvl.id);
            }}
            aria-label={
              lvl.locked
                ? `Level ${lvl.id}, ${lvl.name}, locked`
                : `Play level ${lvl.id}, ${lvl.name}. ${lvl.meta}${lvl.stars ? `, ${lvl.stars} of 3 stars` : ""}`
            }
            display="block"
            w="full"
            textAlign="left"
            bg="surface"
            borderWidth="1px"
            borderColor="border"
            rounded="md"
            p={4}
            cursor="pointer"
            transition="border-color 0.15s ease"
            _hover={lvl.locked ? undefined : { borderColor: "primary.500" }}
            _disabled={{ bg: "background", cursor: "not-allowed" }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text
                fontSize="xl"
                fontWeight="semibold"
                lineHeight="1"
                fontVariantNumeric="tabular-nums"
                color={lvl.locked ? "text.muted" : "text.primary"}
              >
                {lvl.id}
              </Text>
              <Box lineHeight={0} color={lvl.next ? "primary.600" : "text.muted"} aria-hidden>
                {lvl.locked ? (
                  <LuLock size={16} />
                ) : lvl.stars > 0 ? (
                  <HStack gap={0.5}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} as="span" color={i <= lvl.stars ? "yellow.600" : "gray.300"}>
                        <LuStar size={13} strokeWidth={1.5} fill={i <= lvl.stars ? "currentColor" : "none"} />
                      </Box>
                    ))}
                  </HStack>
                ) : (
                  <LuPlay size={16} />
                )}
              </Box>
            </Flex>
            <Text textStyle="label" color={lvl.locked ? "text.secondary" : "text.primary"} lineClamp={1}>
              {lvl.name}
            </Text>
            <Text textStyle="meta" fontSize="xs" color="text.muted" mt={0.5}>
              {lvl.locked ? "Locked" : lvl.meta}
            </Text>
          </chakra.button>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
