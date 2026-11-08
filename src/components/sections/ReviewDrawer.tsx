"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button, chakra, CloseButton, Drawer, Grid, HStack, Portal, Stack, Text, VisuallyHidden } from "@chakra-ui/react";
import { LuStar } from "react-icons/lu";
import { postJson, SubmitError } from "@/components/home/submit";
import { EMAIL_PATTERN, FormAlert, FormSuccess, Honeypot, TextAreaField, TextField } from "@/components/home/fields";
import { EASE_OUT, primaryButton, secondaryButton } from "@/components/home/ui";

interface ReviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    /** Element that should get focus back on close (the button that opened the drawer). */
    returnFocusTo?: () => HTMLElement | null;
}

type Field = "name" | "email" | "role" | "company" | "rating" | "content";
type Errors = Partial<Record<Field, string>>;

const MAX_CONTENT = 2000;

// Backend field name -> form field.
const SERVER_FIELDS: Record<string, Field> = {
    client_name: "name",
    client_email: "email",
    client_position: "role",
    client_company: "company",
    rating: "rating",
    content: "content",
};

const RatingInput = chakra("input");
const RatingLabel = chakra("label");
const RatingFieldset = chakra("fieldset");
const RatingLegend = chakra("legend");

/**
 * Review form in a side drawer. Submissions go to POST /testimonials/public as
 * pending reviews; nothing is added to the list until the review is approved.
 */
export default function ReviewDrawer({ isOpen, onClose, returnFocusTo }: ReviewDrawerProps) {
    const id = useId();
    const nameRef = useRef<HTMLInputElement>(null);
    const inflight = useRef(false);
    const controller = useRef<AbortController | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
    const [sentName, setSentName] = useState("");

    // Ignore a response that lands after the page is gone.
    useEffect(() => () => controller.current?.abort(), []);

    const clearError = (field: Field) => setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

    const validate = (): Errors => {
        const next: Errors = {};
        if (!name.trim()) next.name = "Add your name.";
        else if (name.trim().length > 150) next.name = "Keep your name under 150 characters.";
        if (!email.trim()) next.email = "Add your email address. It isn't shown publicly.";
        else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter an email like name@example.com.";
        if (role.trim().length > 150) next.role = "Keep this under 150 characters.";
        if (company.trim().length > 150) next.company = "Keep this under 150 characters.";
        if (rating < 1) next.rating = "Choose a rating from 1 to 5 stars.";
        if (content.trim().length < 10) next.content = "Write at least 10 characters about working together.";
        else if (content.trim().length > MAX_CONTENT) next.content = "Keep the review under 2,000 characters.";
        return next;
    };

    const reset = () => {
        setName("");
        setEmail("");
        setRole("");
        setCompany("");
        setRating(0);
        setHover(0);
        setContent("");
        setHoneypot("");
        setErrors({});
        setFormError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (inflight.current) return;

        const form = event.currentTarget;
        const found = validate();
        setErrors(found);
        setFormError(null);
        if (Object.keys(found).length > 0) {
            // After React commits the error state, move focus to the first field that needs attention.
            requestAnimationFrame(() => {
                form.querySelector<HTMLElement>("input[aria-invalid='true'], textarea[aria-invalid='true'], fieldset[aria-invalid='true'] input")?.focus();
            });
            return;
        }
        if (honeypot) {
            // Only bots fill the hidden field: act as if it worked, send nothing.
            setSentName(name.trim());
            reset();
            setStatus("sent");
            return;
        }

        inflight.current = true;
        setStatus("submitting");
        controller.current?.abort();
        const abort = new AbortController();
        controller.current = abort;
        try {
            await postJson(
                "/testimonials/public",
                {
                    client_name: name.trim(),
                    client_email: email.trim(),
                    client_position: role.trim() || null,
                    client_company: company.trim() || null,
                    rating,
                    content: content.trim(),
                    honeypot: null,
                },
                abort.signal,
            );
            if (abort.signal.aborted) return;
            setSentName(name.trim());
            reset();
            setStatus("sent");
        } catch (error) {
            if (abort.signal.aborted) return;
            setStatus("idle");
            if (error instanceof SubmitError) {
                const mapped: Errors = {};
                for (const [field, message] of Object.entries(error.fields)) {
                    const key = SERVER_FIELDS[field];
                    if (key) mapped[key] = message;
                }
                setErrors(mapped);
                setFormError(Object.keys(mapped).length > 0 ? null : error.message);
            } else {
                setFormError("Something stopped the review from sending. Your text is still here, so try again.");
            }
        } finally {
            inflight.current = false;
        }
    };

    const submitting = status === "submitting";
    const shown = hover || rating;
    const ratingError = errors.rating;

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={(details) => {
                if (!details.open) onClose();
            }}
            onExitComplete={() => {
                if (status === "sent") setStatus("idle");
            }}
            placement="end"
            size="md"
            initialFocusEl={() => nameRef.current}
            finalFocusEl={returnFocusTo}
            unmountOnExit
            lazyMount
        >
            <Portal>
                <Drawer.Backdrop bg="blackAlpha.400" _motionReduce={{ animation: "none" }} />
                <Drawer.Positioner>
                    <Drawer.Content
                        bg="surface"
                        shadow="xl"
                        borderStartRadius={{ base: "0", sm: "md" }}
                        _motionReduce={{ animation: "none" }}
                    >
                        <Drawer.Header px="6" pt="6" pb="2">
                            <Stack gap="1">
                                <Drawer.Title textStyle="cardTitle" color="text.primary">
                                    Share your experience
                                </Drawer.Title>
                                <Drawer.Description textStyle="meta" color="text.secondary">
                                    Reviews appear on the site after a quick approval.
                                </Drawer.Description>
                            </Stack>
                        </Drawer.Header>
                        <Drawer.CloseTrigger asChild top="5" insetEnd="5">
                            <CloseButton size="sm" aria-label="Close the review form" focusRingColor="primary.500" />
                        </Drawer.CloseTrigger>

                        <Drawer.Body px="6" py="4">
                            {status === "sent" ? (
                                <Stack gap="5" pt="2">
                                    <FormSuccess title={sentName ? `Thank you, ${sentName}` : "Thank you"}>
                                        Your review is waiting for approval. Once it&rsquo;s approved it will show up on this
                                        page.
                                    </FormSuccess>
                                    <HStack gap="3" wrap="wrap">
                                        <Button {...primaryButton} onClick={onClose}>
                                            Close
                                        </Button>
                                        <Button {...secondaryButton} onClick={() => setStatus("idle")}>
                                            Write another
                                        </Button>
                                    </HStack>
                                </Stack>
                            ) : (
                                <form id={`${id}-form`} onSubmit={handleSubmit} noValidate>
                                    <Stack gap="5" position="relative">
                                        <Honeypot name="website_url" value={honeypot} onValueChange={setHoneypot} />
                                        <TextField
                                            ref={nameRef}
                                            label="Name"
                                            name="name"
                                            autoComplete="name"
                                            value={name}
                                            onValueChange={(value) => {
                                                setName(value);
                                                clearError("name");
                                            }}
                                            error={errors.name}
                                            disabled={submitting}
                                        />
                                        <TextField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            inputMode="email"
                                            value={email}
                                            onValueChange={(value) => {
                                                setEmail(value);
                                                clearError("email");
                                            }}
                                            error={errors.email}
                                            helper="Only used if I need to reach you. Never shown."
                                            disabled={submitting}
                                        />
                                        <Grid templateColumns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }} gap="5">
                                            <TextField
                                                label="Role"
                                                optional
                                                name="role"
                                                autoComplete="organization-title"
                                                value={role}
                                                onValueChange={(value) => {
                                                    setRole(value);
                                                    clearError("role");
                                                }}
                                                error={errors.role}
                                                disabled={submitting}
                                            />
                                            <TextField
                                                label="Company"
                                                optional
                                                name="company"
                                                autoComplete="organization"
                                                value={company}
                                                onValueChange={(value) => {
                                                    setCompany(value);
                                                    clearError("company");
                                                }}
                                                error={errors.company}
                                                disabled={submitting}
                                            />
                                        </Grid>

                                        <RatingFieldset
                                            aria-describedby={ratingError ? `${id}-rating-error` : undefined}
                                            aria-invalid={ratingError ? true : undefined}
                                            disabled={submitting}
                                            minW="0"
                                        >
                                            <RatingLegend textStyle="label" color="text.primary" mb="1.5">
                                                Rating
                                            </RatingLegend>
                                            <HStack gap="1" onMouseLeave={() => setHover(0)}>
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <RatingLabel
                                                        key={n}
                                                        position="relative"
                                                        display="inline-flex"
                                                        p="1.5"
                                                        borderRadius="md"
                                                        cursor="pointer"
                                                        color={n <= shown ? "primary.500" : "gray.400"}
                                                        transition={`color 120ms ${EASE_OUT}, background-color 120ms ${EASE_OUT}`}
                                                        _hover={{ bg: "primary.50" }}
                                                        _active={{ bg: "primary.100" }}
                                                        css={{
                                                            "&:has(input:focus-visible)": {
                                                                outline: "2px solid",
                                                                outlineColor: "primary.500",
                                                                outlineOffset: "2px",
                                                            },
                                                            "& svg": { fill: n <= shown ? "currentColor" : "none" },
                                                        }}
                                                        onMouseEnter={() => setHover(n)}
                                                    >
                                                        <RatingInput
                                                            type="radio"
                                                            name={`${id}-rating`}
                                                            value={n}
                                                            checked={rating === n}
                                                            onChange={() => {
                                                                setRating(n);
                                                                clearError("rating");
                                                            }}
                                                            position="absolute"
                                                            opacity="0"
                                                            w="1px"
                                                            h="1px"
                                                            m="0"
                                                        />
                                                        <LuStar size={26} strokeWidth={1.75} aria-hidden="true" />
                                                        <VisuallyHidden>
                                                            {n} star{n > 1 ? "s" : ""}
                                                        </VisuallyHidden>
                                                    </RatingLabel>
                                                ))}
                                                <Text as="span" textStyle="meta" color="text.muted" ms="2" minW="10">
                                                    {rating > 0 ? `${rating} of 5` : ""}
                                                </Text>
                                            </HStack>
                                            {ratingError ? (
                                                <Text id={`${id}-rating-error`} textStyle="meta" color="red.600" mt="1.5">
                                                    {ratingError}
                                                </Text>
                                            ) : null}
                                        </RatingFieldset>

                                        <TextAreaField
                                            label="Your review"
                                            name="content"
                                            rows={6}
                                            maxLength={MAX_CONTENT}
                                            placeholder="What was it like working with Victor? What stood out?"
                                            value={content}
                                            onValueChange={(value) => {
                                                setContent(value);
                                                clearError("content");
                                            }}
                                            error={errors.content}
                                            helper={`${content.trim().length} / ${MAX_CONTENT} characters, at least 10`}
                                            disabled={submitting}
                                        />

                                        {formError ? <FormAlert>{formError}</FormAlert> : null}
                                    </Stack>
                                </form>
                            )}
                        </Drawer.Body>

                        {status === "sent" ? null : (
                            <Drawer.Footer px="6" py="5" borderTopWidth="1px" borderColor="border">
                                <Button
                                    type="submit"
                                    form={`${id}-form`}
                                    {...primaryButton}
                                    w="full"
                                    loading={submitting}
                                    loadingText="Sending review"
                                    disabled={submitting}
                                >
                                    Send review
                                </Button>
                            </Drawer.Footer>
                        )}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
