"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Box, Button, Container, Grid, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { LuChevronDown, LuSend } from "react-icons/lu";
import type { ContactReason } from "@/lib/api";
import { postJson, SubmitError } from "@/components/home/submit";
import { EMAIL_PATTERN, FormAlert, FormSuccess, Honeypot, SelectField, TextAreaField, TextField } from "@/components/home/fields";
import { EASE_OUT, card, primaryButton } from "@/components/home/ui";

type FieldName = "name" | "email" | "subject" | "message";
type Errors = Partial<Record<FieldName, string>>;

const INTERESTS = [
    { value: "web-dev", label: "Web development" },
    { value: "ui-design", label: "UI/UX design" },
    { value: "full-stack", label: "Full-stack project" },
    { value: "consultation", label: "Consultation" },
    { value: "other", label: "Something else" },
];

// "What can I help with?" -> backend contact reason.
const REASON_MAP: Record<string, ContactReason> = {
    "web-dev": "freelance_project",
    "ui-design": "collaboration",
    "full-stack": "freelance_project",
    consultation: "general_inquiry",
    other: "other",
};

const MAX_MESSAGE = 5000;

const FAQ: { question: string; answer: string }[] = [
    {
        question: "Are you taking on new work?",
        answer: "Send a short note about your project and your timeline, and I'll tell you honestly when I can start.",
    },
    {
        question: "What does a project cost?",
        answer:
            "It depends on the scope. I quote a fixed price for defined builds and charge hourly for consulting and smaller changes. Share what you need and I'll send a quote.",
    },
    {
        question: "Do you work with startups?",
        answer: "Yes. I can help an early-stage team build the first version of its product and a design system it can grow with.",
    },
    {
        question: "What tech stack do you use?",
        answer:
            "Mostly TypeScript with React and Next.js on the front end, Node.js or Python with FastAPI on the back end, and PostgreSQL or MongoDB for data. I design in Figma.",
    },
];

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Box py="3.5" borderTopWidth="1px" borderColor="border" minW="0">
            <Text as="dt" textStyle="meta" color="text.muted">
                {label}
            </Text>
            <Box as="dd" textStyle="body" color="text.primary" overflowWrap="anywhere">
                {children}
            </Box>
        </Box>
    );
}

const detailLink = {
    color: "primary.600",
    textDecoration: "underline",
    textDecorationColor: "transparent",
    textUnderlineOffset: "4px",
    transition: `text-decoration-color 160ms ${EASE_OUT}`,
    _hover: { textDecorationColor: "currentColor" },
    focusRingColor: "primary.500",
} as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <Box
            as="details"
            borderRadius="md"
            bg="surface"
            shadow="xs"
            css={{
                "& > summary": { listStyle: "none" },
                "& > summary::-webkit-details-marker": { display: "none" },
                "&[open] .faq-chevron": { transform: "rotate(180deg)" },
            }}
        >
            <Box
                as="summary"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="4"
                px={{ base: "5", md: "6" }}
                py="4"
                cursor="pointer"
                borderRadius="md"
                textStyle="label"
                fontSize="md"
                color="text.primary"
                transition={`color 160ms ${EASE_OUT}`}
                _hover={{ color: "primary.600" }}
                focusRingColor="primary.500"
            >
                <span>{question}</span>
                <Box
                    as="span"
                    className="faq-chevron"
                    display="inline-flex"
                    color="text.muted"
                    flexShrink={0}
                    transition={`transform 220ms ${EASE_OUT}`}
                    aria-hidden="true"
                >
                    <LuChevronDown size={18} />
                </Box>
            </Box>
            <Text px={{ base: "5", md: "6" }} pb="5" textStyle="body" color="text.secondary" maxW="62ch">
                {answer}
            </Text>
        </Box>
    );
}

export default function Contact() {
    const inflight = useRef(false);
    const controller = useRef<AbortController | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [interest, setInterest] = useState("");
    const [message, setMessage] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    // Ignore a response that lands after the page is gone.
    useEffect(() => () => controller.current?.abort(), []);

    const clearError = (field: FieldName) => setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

    const validate = (): Errors => {
        const next: Errors = {};
        if (!name.trim()) next.name = "Add your name.";
        else if (name.trim().length > 100) next.name = "Keep your name under 100 characters.";
        if (!email.trim()) next.email = "Add your email address so I can reply.";
        else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter an email like name@example.com.";
        if (!subject.trim()) next.subject = "Add a short subject.";
        else if (subject.trim().length > 200) next.subject = "Keep the subject under 200 characters.";
        if (message.trim().length < 10) next.message = "Tell me a little more: at least 10 characters.";
        else if (message.trim().length > MAX_MESSAGE) next.message = "Keep the message under 5,000 characters.";
        return next;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (inflight.current) return;

        const form = event.currentTarget;
        const found = validate();
        setErrors(found);
        setFormError(null);
        setSent(false);
        if (Object.keys(found).length > 0) {
            requestAnimationFrame(() => {
                form.querySelector<HTMLElement>("input[aria-invalid='true'], textarea[aria-invalid='true']")?.focus();
            });
            return;
        }
        const reset = () => {
            setName("");
            setEmail("");
            setSubject("");
            setInterest("");
            setMessage("");
            setHoneypot("");
            setErrors({});
        };
        if (honeypot) {
            // Only bots fill the hidden field: act as if it worked, send nothing.
            reset();
            setSent(true);
            return;
        }

        inflight.current = true;
        setSubmitting(true);
        controller.current?.abort();
        const abort = new AbortController();
        controller.current = abort;
        try {
            await postJson(
                "/contact/",
                {
                    name: name.trim(),
                    email: email.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                    contact_reason: REASON_MAP[interest] ?? "general_inquiry",
                    honeypot: null,
                },
                abort.signal,
            );
            if (abort.signal.aborted) return;
            reset();
            setSent(true);
        } catch (error) {
            if (abort.signal.aborted) return;
            if (error instanceof SubmitError) {
                const mapped: Errors = {};
                for (const [field, text] of Object.entries(error.fields)) {
                    if (field === "name" || field === "email" || field === "subject" || field === "message") mapped[field] = text;
                }
                setErrors(mapped);
                setFormError(Object.keys(mapped).length > 0 ? null : error.message);
            } else {
                setFormError("Something stopped the message from sending. Your text is still here, so try again.");
            }
        } finally {
            inflight.current = false;
            if (!abort.signal.aborted) setSubmitting(false);
        }
    };

    return (
        <Box as="section" id="contact" aria-labelledby="contact-title" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" }}
                    gap={{ base: "10", lg: "16" }}
                    alignItems="start"
                >
                    <Stack gap="5" minW="0" maxW="32rem">
                        <Heading
                            as="h2"
                            id="contact-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Let&rsquo;s talk about your project
                        </Heading>
                        <Text textStyle="lead" color="text.secondary">
                            Send a few details about what you&rsquo;re building and I&rsquo;ll get back to you. Please
                            allow a couple of days for a reply.
                        </Text>
                        <Box as="dl" mt="2">
                            <Detail label="Email">
                                <Link href="mailto:kamandembugua18@gmail.com" {...detailLink}>
                                    kamandembugua18@gmail.com
                                </Link>
                            </Detail>
                            <Detail label="Phone">
                                <Link href="tel:+254792823173" {...detailLink}>
                                    +254 (0) 792 823 173
                                </Link>
                            </Detail>
                            <Detail label="Location">Nairobi, Kenya, working remotely</Detail>
                        </Box>
                    </Stack>

                    <Box p={{ base: "5", sm: "6", md: "8" }} css={card} minW="0">
                        <form onSubmit={handleSubmit} noValidate>
                            <Stack gap="5" position="relative">
                                {sent ? (
                                    <Box>
                                        <FormSuccess title="Message sent">
                                            Thanks for getting in touch. I&rsquo;ll reply to your email within a couple of
                                            days.
                                        </FormSuccess>
                                    </Box>
                                ) : null}
                                <Honeypot name="company_website" value={honeypot} onValueChange={setHoneypot} />
                                <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="5">
                                    <TextField
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
                                        inputMode="email"
                                        autoComplete="email"
                                        value={email}
                                        onValueChange={(value) => {
                                            setEmail(value);
                                            clearError("email");
                                        }}
                                        error={errors.email}
                                        disabled={submitting}
                                    />
                                </Grid>
                                <TextField
                                    label="Subject"
                                    name="subject"
                                    value={subject}
                                    onValueChange={(value) => {
                                        setSubject(value);
                                        clearError("subject");
                                    }}
                                    error={errors.subject}
                                    disabled={submitting}
                                />
                                <SelectField
                                    label="What can I help with?"
                                    placeholder="Choose one"
                                    value={interest}
                                    onValueChange={setInterest}
                                    options={INTERESTS}
                                    disabled={submitting}
                                />
                                <TextAreaField
                                    label="Project details"
                                    name="message"
                                    rows={6}
                                    maxLength={MAX_MESSAGE}
                                    placeholder="What are you building, what's your timeline, and roughly what budget do you have in mind?"
                                    value={message}
                                    onValueChange={(value) => {
                                        setMessage(value);
                                        clearError("message");
                                    }}
                                    error={errors.message}
                                    helper="At least 10 characters."
                                    disabled={submitting}
                                />
                                {formError ? <FormAlert>{formError}</FormAlert> : null}
                                <Box>
                                    <Button
                                        type="submit"
                                        {...primaryButton}
                                        w={{ base: "full", sm: "auto" }}
                                        loading={submitting}
                                        loadingText="Sending message"
                                        disabled={submitting}
                                    >
                                        Send message
                                        <LuSend aria-hidden="true" />
                                    </Button>
                                </Box>
                            </Stack>
                        </form>
                    </Box>
                </Grid>

                <Box mt={{ base: "16", lg: "24" }} maxW="3xl" mx="auto">
                    <Heading as="h3" textStyle="sectionTitle" color="text.primary" mb="6" textAlign="center">
                        Questions people ask
                    </Heading>
                    <Stack gap="3">
                        {FAQ.map((item) => (
                            <FaqItem key={item.question} question={item.question} answer={item.answer} />
                        ))}
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
