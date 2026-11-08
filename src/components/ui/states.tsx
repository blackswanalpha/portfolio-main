"use client";

import type { ReactNode } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";

/**
 * Shared, quiet state blocks so every page reports loading / empty / error the
 * same way. Neutral surfaces, hairline border, one accent action. No glow.
 */

interface StateProps {
  title: string;
  description?: ReactNode;
  /** Optional icon (lucide via react-icons/lu), rendered muted at 20px. */
  icon?: ReactNode;
  /** Primary action, e.g. a link button back to a list. */
  action?: ReactNode;
  /** Compact variant for use inside cards/tables. */
  compact?: boolean;
}

function StateFrame({ title, description, icon, action, compact, role }: StateProps & { role?: string }) {
  return (
    <Flex
      role={role}
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap={3}
      py={compact ? 8 : 16}
      px={6}
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      bg="surface"
      w="full"
    >
      {icon ? (
        <Box color="text.muted" fontSize="20px" lineHeight={0} aria-hidden>
          {icon}
        </Box>
      ) : null}
      <Text fontSize={compact ? "md" : "lg"} fontWeight={600} color="text.primary">
        {title}
      </Text>
      {description ? (
        <Text fontSize="sm" color="text.secondary" maxW="md" lineHeight={1.6}>
          {description}
        </Text>
      ) : null}
      {action ? <Box pt={2}>{action}</Box> : null}
    </Flex>
  );
}

/** Nothing to show yet. Not an error. */
export function EmptyState(props: StateProps) {
  return <StateFrame {...props} />;
}

/** A request failed. Always offers a retry when `onRetry` is given. */
export function ErrorState({
  title = "Couldn't load this",
  description = "Check your connection and try again.",
  onRetry,
  retrying,
  ...rest
}: Partial<StateProps> & { onRetry?: () => void; retrying?: boolean }) {
  return (
    <StateFrame
      role="alert"
      title={title}
      description={description}
      {...rest}
      action={
        rest.action ??
        (onRetry ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            loading={retrying}
            loadingText="Retrying"
          >
            <LuRefreshCw aria-hidden />
            Try again
          </Button>
        ) : undefined)
      }
    />
  );
}

/** Short human message for an API error (uses the backend's message when present). */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  if (error instanceof Error && error.message && error.message !== "Failed to fetch") {
    return error.message;
  }
  if (error instanceof TypeError || (error instanceof Error && error.message === "Failed to fetch")) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}
