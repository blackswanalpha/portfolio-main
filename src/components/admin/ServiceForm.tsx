"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, HStack, Input, SimpleGrid, Text, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { FormActions, FormField, FormShell, SelectField, controlProps, focusFirstInvalid } from "./AdminUI";
import { hasErrors, integerError, splitLines, type FieldErrors } from "./forms";
import { useServicesStore, SERVICE_ICON_OPTIONS, SERVICE_ICONS, type Service } from "@/store/services";

const BACK = { href: "/admin/services", label: "Back to services" };

export default function ServiceForm({ initial }: { initial?: Service | null }) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;
    const addService = useServicesStore((s) => s.addService);
    const updateService = useServicesStore((s) => s.updateService);

    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [features, setFeatures] = useState((initial?.features ?? []).join("\n"));
    const [price, setPrice] = useState(initial?.price ?? "");
    const [priceLabel, setPriceLabel] = useState(initial?.priceLabel ?? "Starting at");
    const [iconKey, setIconKey] = useState(initial?.iconKey ?? "code");
    const [order, setOrder] = useState(String(initial?.order ?? 0));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [saving, setSaving] = useState(false);

    const SelectedIcon = SERVICE_ICONS[iconKey] ?? SERVICE_ICONS.code;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current) return;
        const found: FieldErrors = {
            title: title.trim() ? undefined : "Title is required",
            order: integerError(order),
        };
        setErrors(found);
        if (hasErrors(found)) {
            focusFirstInvalid(formRef.current);
            return;
        }
        lock.current = true;
        setSaving(true);
        const data: Omit<Service, "id"> = {
            title: title.trim(),
            description: description.trim(),
            features: splitLines(features),
            price: price.trim(),
            priceLabel: priceLabel.trim() || "Starting at",
            iconKey,
            order: Number(order.trim() || 0),
        };
        if (isEdit && initial) {
            updateService(initial.id, data);
            toast.success("Service saved");
        } else {
            addService(data);
            toast.success("Service created");
        }
        // Stays locked until the route changes.
        router.push(BACK.href);
    };

    return (
        <FormShell title={isEdit ? "Edit service" : "New service"} back={BACK} formRef={formRef} onSubmit={handleSubmit}>
            <Text fontSize="sm" color="text.secondary">
                Saved in this browser only. Changes aren&apos;t sent to the server.
            </Text>

            <FormField label="Title" required error={errors.title}>
                <Input {...controlProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Web development" />
            </FormField>

            <FormField label="Description">
                <Textarea {...controlProps} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="High-performance React and Next.js applications" />
            </FormField>

            <FormField label="Features" helper="One per line.">
                <Textarea {...controlProps} value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} placeholder={"Next.js / React\nType-safe APIs\nSEO-ready"} />
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Price" helper="Free-form, e.g. $5,000 or Custom.">
                    <Input {...controlProps} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$5,000" />
                </FormField>
                <FormField label="Price label">
                    <Input {...controlProps} value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="Starting at" />
                </FormField>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Icon">
                    <HStack gap={3} w="full">
                        <Box
                            flexShrink={0}
                            w={10}
                            h={10}
                            rounded="lg"
                            bg="gray.100"
                            color="text.secondary"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            aria-hidden
                        >
                            <SelectedIcon size={18} />
                        </Box>
                        <Box flex={1}>
                            <SelectField value={iconKey} onChange={setIconKey} options={SERVICE_ICON_OPTIONS} />
                        </Box>
                    </HStack>
                </FormField>
                <FormField label="Display order" helper="Lower numbers appear first." error={errors.order}>
                    <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={order} onChange={(e) => setOrder(e.target.value)} />
                </FormField>
            </SimpleGrid>

            <FormActions submitting={saving} submitLabel={isEdit ? "Save changes" : "Create service"} cancelHref={BACK.href} />
        </FormShell>
    );
}
