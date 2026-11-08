"use client";

import { forwardRef, type ReactNode } from "react";
import { Box, Field, HStack, Input, NativeSelect, Text, Textarea, type InputProps, type TextareaProps } from "@chakra-ui/react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { EASE_OUT } from "./ui";

/* Form controls for the contact form and the review drawer: 6px radius,
   visible boundary, brand focus ring, inline error under each field. */

const control = {
    bg: "surface",
    borderRadius: "md",
    borderColor: "border.control",
    color: "text.primary",
    fontSize: "md",
    focusRingColor: "primary.500",
    transition: `border-color 160ms ${EASE_OUT}`,
    _placeholder: { color: "text.muted" },
    _hover: { borderColor: "border.controlHover" },
    _disabled: { opacity: 0.6, cursor: "not-allowed" },
} as const;

interface FieldShellProps {
    label: string;
    error?: string;
    helper?: ReactNode;
    optional?: boolean;
    children: ReactNode;
}

function FieldShell({ label, error, helper, optional, children }: FieldShellProps) {
    return (
        <Field.Root invalid={!!error} gap="1.5">
            <Field.Label textStyle="label" color="text.primary">
                {label}
                {optional ? (
                    <Text as="span" color="text.muted" fontWeight="400">
                        {" "}
                        (optional)
                    </Text>
                ) : null}
            </Field.Label>
            {children}
            {error ? (
                <Field.ErrorText textStyle="meta" color="red.600">
                    {error}
                </Field.ErrorText>
            ) : helper ? (
                <Field.HelperText textStyle="meta" color="text.muted">
                    {helper}
                </Field.HelperText>
            ) : null}
        </Field.Root>
    );
}

type TextFieldProps = Omit<InputProps, "onChange" | "value"> & {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    error?: string;
    helper?: ReactNode;
    optional?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    { label, value, onValueChange, error, helper, optional, ...inputProps },
    ref,
) {
    return (
        <FieldShell label={label} error={error} helper={helper} optional={optional}>
            <Input
                ref={ref}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                h="11"
                px="3.5"
                {...control}
                {...inputProps}
            />
        </FieldShell>
    );
});

type TextAreaFieldProps = Omit<TextareaProps, "onChange" | "value"> & {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    error?: string;
    helper?: ReactNode;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
    { label, value, onValueChange, error, helper, ...areaProps },
    ref,
) {
    return (
        <FieldShell label={label} error={error} helper={helper}>
            <Textarea
                ref={ref}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                px="3.5"
                py="3"
                resize="vertical"
                minH="32"
                {...control}
                {...areaProps}
            />
        </FieldShell>
    );
});

export function SelectField({
    label,
    value,
    onValueChange,
    options,
    placeholder,
    disabled,
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
}) {
    return (
        <FieldShell label={label} optional>
            <NativeSelect.Root disabled={disabled}>
                <NativeSelect.Field
                    value={value}
                    onChange={(event) => onValueChange(event.currentTarget.value)}
                    h="11"
                    ps="3.5"
                    {...control}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator color="text.muted" />
            </NativeSelect.Root>
        </FieldShell>
    );
}

/** Form-level problem (server, network, rate limit). Announced, and the input stays as typed. */
export function FormAlert({ children }: { children: ReactNode }) {
    return (
        <HStack
            role="alert"
            align="start"
            gap="2.5"
            p="3.5"
            borderRadius="md"
            bg="red.50"
            borderWidth="1px"
            borderColor="red.200"
            color="red.800"
            textStyle="body"
        >
            <Box as="span" mt="1" flexShrink={0} aria-hidden="true">
                <LuCircleAlert size={16} />
            </Box>
            <Text as="span">{children}</Text>
        </HStack>
    );
}

/** Quiet confirmation after a successful send. */
export function FormSuccess({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <HStack
            role="status"
            align="start"
            gap="2.5"
            p="3.5"
            borderRadius="md"
            bg="green.50"
            borderWidth="1px"
            borderColor="green.200"
            color="green.900"
        >
            <Box as="span" mt="1" flexShrink={0} color="green.700" aria-hidden="true">
                <LuCircleCheck size={16} />
            </Box>
            <Box>
                <Text textStyle="label">{title}</Text>
                {children ? (
                    <Text textStyle="body" color="green.800" mt="0.5">
                        {children}
                    </Text>
                ) : null}
            </Box>
        </HStack>
    );
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Visually hidden bot trap. Real people never see or fill it. */
export function Honeypot({ name, value, onValueChange }: { name: string; value: string; onValueChange: (value: string) => void }) {
    return (
        <Box position="absolute" left="-9999px" top="auto" w="1px" h="1px" overflow="hidden" aria-hidden="true">
            <label>
                Leave this field empty
                <input
                    type="text"
                    name={name}
                    tabIndex={-1}
                    autoComplete="off"
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                />
            </label>
        </Box>
    );
}
