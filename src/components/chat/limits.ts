// Limits shared by the chat UI and /api/chat, so the client and the route
// reject the same input. Plain module (no "use client") so the route handler
// imports real values.

/** Characters allowed in one user message. */
export const MAX_MESSAGE_LENGTH = 500;

/** Characters allowed in any message sent back as context (assistant replies are longer). */
export const MAX_CONTEXT_MESSAGE_LENGTH = 4000;

/** Messages allowed in one request. */
export const MAX_REQUEST_MESSAGES = 20;
