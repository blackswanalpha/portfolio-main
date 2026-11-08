"use client";

/**
 * Shared admin building blocks. Every admin page uses these so page headers,
 * lists, stat cards, filter tabs, form fields and buttons look the same
 * everywhere (Operate mode: quiet chrome, hairlines, one accent).
 */

import Link from "next/link";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    Field,
    Flex,
    Heading,
    HStack,
    IconButton,
    NativeSelect,
    Portal,
    Skeleton,
    Switch,
    Text,
    VisuallyHidden,
    type BoxProps,
    type ButtonProps,
    type FlexProps,
} from "@chakra-ui/react";
import { LuArrowLeft, LuCircleAlert, LuSearchX, LuStar } from "react-icons/lu";
import { EmptyState } from "@/components/ui/states";

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

const BRAND_FOCUS = { focusRingColor: "primary.500" } as const;

/** The one filled button style (primary action of a screen or form). */
export const primaryButton = {
    ...BRAND_FOCUS,
    bg: "primary.500",
    color: "white",
    rounded: "lg",
    fontWeight: 500,
    transition: "background-color 0.15s ease-out",
    _hover: { bg: "primary.600" },
    _active: { bg: "primary.700" },
} satisfies ButtonProps;

/** Bordered secondary button. */
export const secondaryButton = {
    ...BRAND_FOCUS,
    variant: "outline",
    bg: "surface",
    color: "text.primary",
    borderColor: "gray.300",
    rounded: "lg",
    fontWeight: 500,
    transition: "background-color 0.15s ease-out, border-color 0.15s ease-out",
    _hover: { bg: "gray.50", borderColor: "gray.400" },
    _active: { bg: "gray.100" },
} satisfies ButtonProps;

/** Text-only button (cancel, tertiary). */
export const ghostButton = {
    ...BRAND_FOCUS,
    variant: "ghost",
    color: "text.secondary",
    rounded: "lg",
    fontWeight: 500,
    transition: "background-color 0.15s ease-out, color 0.15s ease-out",
    _hover: { bg: "gray.100", color: "text.primary" },
    _active: { bg: "gray.200" },
} satisfies ButtonProps;

/** Destructive filled button (confirm delete). */
export const dangerButton = {
    focusRingColor: "red.600",
    bg: "red.600",
    color: "white",
    rounded: "lg",
    fontWeight: 500,
    transition: "background-color 0.15s ease-out",
    _hover: { bg: "red.700" },
    _active: { bg: "red.800" },
} satisfies ButtonProps;

const iconButtonTone = {
    neutral: { color: "text.secondary", _hover: { bg: "gray.100", color: "text.primary" }, _active: { bg: "gray.200" } },
    danger: { color: "text.secondary", _hover: { bg: "red.50", color: "red.600" }, _active: { bg: "red.100" } },
} as const;

interface RowIconButtonProps {
    label: string;
    icon: ReactNode;
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    tone?: "neutral" | "danger";
    /** Marks a toggle that is currently on (e.g. featured). */
    pressed?: boolean;
}

/** Square icon button for row actions. Always labelled for screen readers and tooltips. */
export function RowIconButton({ label, icon, onClick, loading, disabled, tone = "neutral", pressed }: RowIconButtonProps) {
    return (
        <IconButton
            aria-label={label}
            title={label}
            aria-pressed={pressed}
            size="sm"
            variant="ghost"
            rounded="md"
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            transition="background-color 0.15s ease-out, color 0.15s ease-out"
            {...BRAND_FOCUS}
            {...iconButtonTone[tone]}
        >
            {icon}
        </IconButton>
    );
}

/** Icon link styled like RowIconButton (edit, open). */
export function RowIconLink({ label, icon, href, disabled }: { label: string; icon: ReactNode; href: string; disabled?: boolean }) {
    if (disabled) {
        return <RowIconButton label={label} icon={icon} disabled />;
    }
    return (
        <IconButton
            asChild
            aria-label={label}
            title={label}
            size="sm"
            variant="ghost"
            rounded="md"
            transition="background-color 0.15s ease-out, color 0.15s ease-out"
            {...BRAND_FOCUS}
            {...iconButtonTone.neutral}
        >
            <Link href={href}>{icon}</Link>
        </IconButton>
    );
}

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

/** Quiet "back to list" link shown above a page title. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Box
            asChild
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            mb={3}
            fontSize="sm"
            fontWeight={500}
            color="text.secondary"
            rounded="md"
            transition="color 0.15s ease-out"
            _hover={{ color: "primary.600" }}
        >
            <Link href={href}>
                <LuArrowLeft aria-hidden />
                {children}
            </Link>
        </Box>
    );
}

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    back?: { href: string; label: string };
}

/** Page h1 + optional one-line description and actions. One per page. */
export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
    return (
        <Box mb={6}>
            {back ? <BackLink href={back.href}>{back.label}</BackLink> : null}
            <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} gap={4} wrap="wrap">
                <Box minW={0}>
                    <Heading as="h1" textStyle="adminTitle" color="text.primary">
                        {title}
                    </Heading>
                    {description ? (
                        <Text textStyle="meta" color="text.secondary" mt={1}>
                            {description}
                        </Text>
                    ) : null}
                </Box>
                {actions ? (
                    <HStack gap={2} flexShrink={0} wrap="wrap">
                        {actions}
                    </HStack>
                ) : null}
            </Flex>
        </Box>
    );
}

/** Raised surface with a hairline (cards, form containers). */
export function Panel({ children, ...rest }: BoxProps) {
    return (
        <Box bg="surface" border="1px solid" borderColor="border" rounded="xl" p={{ base: 5, md: 6 }} {...rest}>
            {children}
        </Box>
    );
}

/** h2 inside a panel or between sections. */
export function SectionTitle({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
    return (
        <Flex justify="space-between" align="flex-start" gap={4} mb={5}>
            <Box minW={0}>
                <Heading as="h2" textStyle="adminSection" color="text.primary">
                    {title}
                </Heading>
                {description ? (
                    <Text textStyle="meta" color="text.secondary" mt={1}>
                        {description}
                    </Text>
                ) : null}
            </Box>
            {actions}
        </Flex>
    );
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

/** Container for list rows: one surface, hairline dividers. */
export function ListPanel({ children, label, ...rest }: BoxProps & { label?: string }) {
    return (
        <Box
            as="ul"
            aria-label={label}
            listStyleType="none"
            bg="surface"
            border="1px solid"
            borderColor="border"
            rounded="xl"
            overflow="hidden"
            {...rest}
        >
            {children}
        </Box>
    );
}

/** One list row. Same height, padding and divider on every admin list. */
export function ListRow({ children, ...rest }: FlexProps) {
    return (
        <Flex
            as="li"
            align="center"
            justify="space-between"
            gap={4}
            px={{ base: 4, md: 5 }}
            py={3}
            minH="16"
            _notFirst={{ borderTop: "1px solid", borderColor: "border" }}
            {...rest}
        >
            {children}
        </Flex>
    );
}

/** 48px square thumbnail slot (image or icon). */
export function RowMedia({ children }: { children: ReactNode }) {
    return (
        <Flex
            w={12}
            h={12}
            rounded="md"
            overflow="hidden"
            bg="gray.100"
            color="text.muted"
            flexShrink={0}
            align="center"
            justify="center"
            fontSize="20px"
        >
            {children}
        </Flex>
    );
}

interface RowTextProps {
    title: ReactNode;
    /** Makes the title a link (keyboard reachable). */
    href?: string;
    badges?: ReactNode;
    /** Secondary line items, joined with a middle dot. */
    meta?: ReactNode[];
    /** Optional extra line between title and meta (e.g. a message preview). */
    preview?: ReactNode;
}

/** Title + badges, optional preview, and a meta line. */
export function RowText({ title, href, badges, meta, preview }: RowTextProps) {
    const items = (meta ?? []).filter((m) => m !== null && m !== undefined && m !== false && m !== "");
    return (
        <Box minW={0} flex={1}>
            <Flex align="center" gap={2} minW={0} wrap="wrap">
                {href ? (
                    <Box
                        asChild
                        fontWeight={500}
                        color="text.primary"
                        lineClamp={1}
                        rounded="sm"
                        transition="color 0.15s ease-out"
                        _hover={{ color: "primary.600", textDecoration: "underline", textUnderlineOffset: "3px" }}
                    >
                        <Link href={href}>{title}</Link>
                    </Box>
                ) : (
                    <Text fontWeight={500} color="text.primary" lineClamp={1}>
                        {title}
                    </Text>
                )}
                {badges}
            </Flex>
            {preview ? (
                <Text fontSize="sm" color="text.secondary" lineClamp={1} mt={0.5}>
                    {preview}
                </Text>
            ) : null}
            {items.length > 0 ? (
                <Text textStyle="meta" color="text.secondary" mt={0.5} lineClamp={1}>
                    {items.map((m, i) => (
                        <Box as="span" key={i}>
                            {i > 0 ? " · " : null}
                            {m}
                        </Box>
                    ))}
                </Text>
            ) : null}
        </Box>
    );
}

/** Row action group (keeps icon buttons aligned in one column). */
export function RowActions({ children }: { children: ReactNode }) {
    return (
        <HStack gap={1} flexShrink={0}>
            {children}
        </HStack>
    );
}

/** Skeleton rows matching ListRow, for first load. */
export function ListSkeleton({ rows = 5, media = false, actions = 3, label = "Loading" }: { rows?: number; media?: boolean; actions?: number; label?: string }) {
    return (
        <Box role="status" aria-live="polite">
            <VisuallyHidden>{label}</VisuallyHidden>
            <ListPanel aria-hidden>
                {Array.from({ length: rows }, (_, i) => (
                    <ListRow key={i}>
                        <HStack gap={4} flex={1} minW={0}>
                            {media ? <Skeleton w={12} h={12} rounded="md" flexShrink={0} /> : null}
                            <Box flex={1} minW={0}>
                                <Skeleton h={4} w={{ base: "70%", md: "40%" }} rounded="sm" />
                                <Skeleton h={3} w={{ base: "50%", md: "28%" }} rounded="sm" mt={2} />
                            </Box>
                        </HStack>
                        <HStack gap={1} flexShrink={0}>
                            {Array.from({ length: actions }, (_, j) => (
                                <Skeleton key={j} w={8} h={8} rounded="md" />
                            ))}
                        </HStack>
                    </ListRow>
                ))}
            </ListPanel>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Filters, badges, stats
// ---------------------------------------------------------------------------

export interface FilterOption<T extends string | number> {
    value: T;
    label: string;
}

/** Filter chips. One active chip, pressed state exposed to assistive tech. */
export function FilterTabs<T extends string | number>({
    options,
    value,
    onChange,
    label,
    mb = 4,
}: {
    options: FilterOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    mb?: BoxProps["mb"];
}) {
    return (
        <HStack role="group" aria-label={label} gap={1} mb={mb} wrap="wrap">
            {options.map((o) => {
                const active = o.value === value;
                return (
                    <Button
                        key={String(o.value)}
                        size="sm"
                        variant="ghost"
                        aria-pressed={active}
                        onClick={() => onChange(o.value)}
                        rounded="lg"
                        fontWeight={500}
                        borderWidth="1px"
                        borderColor={active ? "primary.200" : "transparent"}
                        bg={active ? "primary.50" : "transparent"}
                        color={active ? "primary.700" : "text.secondary"}
                        transition="background-color 0.15s ease-out, color 0.15s ease-out"
                        _hover={active ? { bg: "primary.100" } : { bg: "gray.100", color: "text.primary" }}
                        _active={{ bg: active ? "primary.100" : "gray.200" }}
                        {...BRAND_FOCUS}
                    >
                        {o.label}
                    </Button>
                );
            })}
        </HStack>
    );
}

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_PALETTE: Record<BadgeTone, string> = {
    neutral: "gray",
    success: "green",
    warning: "yellow",
    danger: "red",
    info: "blue",
};

/** Quiet status label. Text comes from a label map (sentence case), never CSS capitalize. */
export function StatusBadge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
    return (
        <Box
            as="span"
            display="inline-flex"
            alignItems="center"
            gap={1}
            px={2}
            h={5}
            rounded="md"
            fontSize="xs"
            fontWeight={500}
            lineHeight="1"
            whiteSpace="nowrap"
            bg={`${TONE_PALETTE[tone]}.100`}
            color={`${TONE_PALETTE[tone]}.800`}
        >
            {children}
        </Box>
    );
}

/** Five lucide stars, filled up to `rating`. */
export function RatingStars({ rating }: { rating: number }) {
    const r = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <Box as="span" display="inline-flex" alignItems="center" gap={0.5} verticalAlign="middle" role="img" aria-label={`${r} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
                <Box as="span" key={i} color={i < r ? "yellow.500" : "gray.300"} lineHeight={0} aria-hidden>
                    <LuStar size={12} fill={i < r ? "currentColor" : "none"} />
                </Box>
            ))}
        </Box>
    );
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

/** Unknown id on an edit/detail route. */
export function NotFoundState({ title, description, backHref, backLabel }: { title: string; description?: string; backHref: string; backLabel: string }) {
    return (
        <EmptyState
            icon={<LuSearchX />}
            title={title}
            description={description ?? "It may have been deleted, or the link is wrong."}
            action={
                <Button asChild size="sm" {...secondaryButton}>
                    <Link href={backHref}>
                        <LuArrowLeft aria-hidden />
                        {backLabel}
                    </Link>
                </Button>
            }
        />
    );
}

/**
 * Empty or error message inside a Panel. The shared EmptyState/ErrorState
 * draw their own bordered card, which would nest a card inside a card here.
 */
export function PanelNote({
    title,
    description,
    onRetry,
    retrying,
    error,
}: {
    title: string;
    description?: string;
    onRetry?: () => void;
    retrying?: boolean;
    error?: boolean;
}) {
    return (
        <Flex role={error ? "alert" : undefined} direction="column" align="center" textAlign="center" gap={1} py={6} px={4}>
            <Text fontSize="sm" fontWeight={500} color="text.primary">
                {title}
            </Text>
            {description ? (
                <Text fontSize="sm" color="text.secondary" maxW="xs">
                    {description}
                </Text>
            ) : null}
            {onRetry ? (
                <Button size="xs" mt={2} {...secondaryButton} onClick={onRetry} loading={retrying} loadingText="Retrying">
                    Try again
                </Button>
            ) : null}
        </Flex>
    );
}

/** Placeholder with the shape of a form, shown until the record loads. */
export function FormSkeleton({ fields = 6, label = "Loading" }: { fields?: number; label?: string }) {
    return (
        <Box role="status" aria-live="polite" maxW="3xl">
            <VisuallyHidden>{label}</VisuallyHidden>
            <Panel aria-hidden>
                <Flex direction="column" gap={6}>
                    {Array.from({ length: fields }, (_, i) => (
                        <Box key={i}>
                            <Skeleton h={3.5} w="24" rounded="sm" mb={2} />
                            <Skeleton h={10} w="full" rounded="lg" />
                        </Box>
                    ))}
                    <HStack gap={3}>
                        <Skeleton h={10} w="32" rounded="lg" />
                        <Skeleton h={10} w="20" rounded="lg" />
                    </HStack>
                </Flex>
            </Panel>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Confirmation
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: ReactNode;
    confirmLabel: string;
    pending?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** In-page confirmation for destructive actions. Focus starts on Cancel. */
export function ConfirmDialog({ open, title, description, confirmLabel, pending, error, onConfirm, onCancel }: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    return (
        <Dialog.Root
            role="alertdialog"
            open={open}
            onOpenChange={(e) => {
                if (!e.open) onCancel();
            }}
            placement="center"
            size="sm"
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
            initialFocusEl={() => cancelRef.current}
            lazyMount
            unmountOnExit
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner px={4}>
                    <Dialog.Content rounded="xl" bg="surface" boxShadow="lg">
                        <Dialog.Header pb={2}>
                            <Dialog.Title textStyle="adminSection" color="text.primary">
                                {title}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {description ? (
                                <Dialog.Description fontSize="sm" color="text.secondary" lineHeight={1.6}>
                                    {description}
                                </Dialog.Description>
                            ) : null}
                            {error ? (
                                <Flex role="alert" mt={3} gap={2} align="flex-start" color="red.700" fontSize="sm">
                                    <Box as="span" mt="2px" flexShrink={0} aria-hidden>
                                        <LuCircleAlert />
                                    </Box>
                                    {error}
                                </Flex>
                            ) : null}
                        </Dialog.Body>
                        <Dialog.Footer gap={2}>
                            <Button ref={cancelRef} size="sm" {...ghostButton} onClick={onCancel} disabled={pending}>
                                Cancel
                            </Button>
                            <Button size="sm" {...dangerButton} onClick={onConfirm} loading={pending} loadingText={confirmLabel}>
                                {confirmLabel}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

/**
 * Shared look for Input / Textarea / NativeSelect.Field. Neutral border, brand
 * focus ring, red when invalid (Field.Root sets aria-invalid).
 */
export const controlProps = {
    bg: "surface",
    color: "text.primary",
    borderColor: "gray.300",
    rounded: "lg",
    transition: "border-color 0.15s ease-out",
    _placeholder: { color: "text.muted" },
    _hover: { borderColor: "gray.400" },
    _invalid: { borderColor: "red.500", _hover: { borderColor: "red.600" } },
    _disabled: { bg: "gray.50", cursor: "not-allowed", opacity: 0.7 },
    css: { "--focus-color": "var(--chakra-colors-primary-500)" },
} as const;

interface FormFieldProps {
    label: ReactNode;
    helper?: ReactNode;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    children: ReactNode;
}

/**
 * Submit count of the enclosing TrackedForm (null outside one). A field hides
 * its error once edited after a submit, and shows it again if the next submit
 * still fails, so a corrected value never sits next to a stale message.
 */
const SubmitCountContext = createContext<number | null>(null);

/** Label, control, then either the inline error or the helper text. */
export function FormField({ label, helper, error, required, disabled, children }: FormFieldProps) {
    const submits = useContext(SubmitCountContext);
    const [editedAt, setEditedAt] = useState<number | null>(null);
    const shown = error && (submits === null || editedAt !== submits) ? error : undefined;
    return (
        <Field.Root
            invalid={!!shown}
            required={required}
            disabled={disabled}
            gap={1.5}
            onChange={() => {
                if (error && submits !== null) setEditedAt(submits);
            }}
        >
            <Field.Label textStyle="label" color="text.secondary" gap={1}>
                {label}
                <Field.RequiredIndicator color="red.600" />
            </Field.Label>
            {children}
            {shown ? (
                <Field.ErrorText fontSize="sm" color="red.700">
                    {shown}
                </Field.ErrorText>
            ) : helper ? (
                <Field.HelperText fontSize="sm" color="text.secondary">
                    {helper}
                </Field.HelperText>
            ) : null}
        </Field.Root>
    );
}

/** A <form> that counts submits for FormField's error display. */
export function TrackedForm({
    formRef,
    onSubmit,
    children,
}: {
    formRef?: React.Ref<HTMLFormElement>;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    children: ReactNode;
}) {
    const [submits, setSubmits] = useState(0);
    return (
        <form
            ref={formRef}
            noValidate
            onSubmit={(e) => {
                setSubmits((n) => n + 1);
                onSubmit(e);
            }}
        >
            <SubmitCountContext.Provider value={submits}>{children}</SubmitCountContext.Provider>
        </form>
    );
}

/** Native select with the shared control look. Place inside FormField. */
export function SelectField({
    value,
    onChange,
    options,
    disabled,
    w,
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
    w?: BoxProps["w"];
}) {
    return (
        <NativeSelect.Root disabled={disabled} w={w}>
            <NativeSelect.Field value={value} onChange={(e) => onChange(e.target.value)} cursor="pointer" {...controlProps}>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator color="text.secondary" />
        </NativeSelect.Root>
    );
}

/** Brand-colored checkbox with a label. */
export function CheckboxField({
    checked,
    onChange,
    children,
    disabled,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
    disabled?: boolean;
}) {
    return (
        <Checkbox.Root checked={checked} onCheckedChange={(d) => onChange(d.checked === true)} disabled={disabled} gap={2.5}>
            <Checkbox.HiddenInput />
            <Checkbox.Control
                borderColor="gray.400"
                rounded="sm"
                focusRingColor="primary.500"
                _checked={{ bg: "primary.500", borderColor: "primary.500", color: "white" }}
            />
            <Checkbox.Label fontSize="sm" fontWeight={400} color="text.primary">
                {children}
            </Checkbox.Label>
        </Checkbox.Root>
    );
}

/** Brand-colored switch row: label and description left, control right. */
export function SwitchRow({
    label,
    description,
    checked,
    onChange,
    disabled,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <Switch.Root
            checked={checked}
            onCheckedChange={(e) => onChange(e.checked)}
            disabled={disabled}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={4}
            w="full"
        >
            <Box>
                <Switch.Label fontSize="sm" fontWeight={500} color="text.primary">
                    {label}
                </Switch.Label>
                {description ? (
                    <Text fontSize="sm" color="text.secondary">
                        {description}
                    </Text>
                ) : null}
            </Box>
            <Switch.HiddenInput />
            <Switch.Control focusRingColor="primary.500" _checked={{ bg: "primary.500" }} flexShrink={0}>
                <Switch.Thumb />
            </Switch.Control>
        </Switch.Root>
    );
}

/** Form-level error (server message, or a summary of field errors). */
export function FormBanner({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <Flex
            role="alert"
            gap={2.5}
            align="flex-start"
            mb={6}
            px={4}
            py={3}
            rounded="lg"
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            color="red.800"
            fontSize="sm"
        >
            <Box as="span" mt="2px" flexShrink={0} aria-hidden>
                <LuCircleAlert />
            </Box>
            <Text>{message}</Text>
        </Flex>
    );
}

/** Submit + cancel row at the end of a form. */
export function FormActions({
    submitting,
    submitLabel,
    cancelHref,
    disabled,
    note,
}: {
    submitting: boolean;
    submitLabel: string;
    cancelHref: string;
    disabled?: boolean;
    /** Why submit is disabled, e.g. an upload still running. */
    note?: string;
}) {
    return (
        <Flex gap={3} pt={2} align="center" wrap="wrap">
            <Button type="submit" {...primaryButton} loading={submitting} loadingText="Saving" disabled={disabled}>
                {submitLabel}
            </Button>
            <Button asChild {...ghostButton}>
                <Link href={cancelHref}>Cancel</Link>
            </Button>
            {note ? (
                <Text fontSize="sm" color="text.secondary" role="status">
                    {note}
                </Text>
            ) : null}
        </Flex>
    );
}

/** Page header + panel + form element shared by every create/edit screen. */
export function FormShell({
    title,
    back,
    formRef,
    onSubmit,
    banner,
    children,
    maxW = "3xl",
}: {
    title: string;
    back: { href: string; label: string };
    formRef?: React.Ref<HTMLFormElement>;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    banner?: string | null;
    children: ReactNode;
    maxW?: BoxProps["maxW"];
}) {
    return (
        <Box maxW={maxW}>
            <PageHeader title={title} back={back} />
            <Panel>
                <TrackedForm formRef={formRef} onSubmit={onSubmit}>
                    <FormBanner message={banner} />
                    <Flex direction="column" gap={6}>
                        {children}
                    </Flex>
                </TrackedForm>
            </Panel>
        </Box>
    );
}

/** Move focus to the first invalid control after a failed validation. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
    if (!form) return;
    requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
}
