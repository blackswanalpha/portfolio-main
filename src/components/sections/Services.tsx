"use client";

import { useMemo } from "react";
import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuBrainCircuit, LuCheck, LuCloud, LuCode, LuLayers, LuPalette, LuPenTool, LuSmartphone } from "react-icons/lu";
import { useApi } from "@/hooks/useApi";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import type { FreelanceWork, Paginated } from "@/lib/api";
import { card, Placeholder, primaryButton, secondaryButton } from "@/components/home/ui";

interface ServiceCardData {
    id: string;
    icon: IconType;
    title: string;
    description: string;
    features: string[];
    price: string;
    priceLabel: string;
}

/**
 * Fallback when the API has no active services or can't be reached. Visitors
 * normally see the services managed in the admin (GET /freelance/).
 */
const FALLBACK_SERVICES: ServiceCardData[] = [
    {
        id: "web-development",
        icon: LuCode,
        title: "Web development",
        description: "High-performance React, Next.js & Node applications engineered for scale, speed and longevity.",
        features: ["Next.js / React", "Type-safe APIs", "Core Web Vitals", "SEO-ready"],
        price: "$5,000",
        priceLabel: "Starting at",
    },
    {
        id: "mobile-apps",
        icon: LuSmartphone,
        title: "Mobile apps",
        description: "Native-feeling cross-platform apps with fluid motion and offline-first reliability.",
        features: ["React Native", "Push & sync", "App store ready", "Native modules"],
        price: "$7,500",
        priceLabel: "Starting at",
    },
    {
        id: "custom-software",
        icon: LuLayers,
        title: "Custom software",
        description: "Bespoke platforms, internal tools and SaaS products built around how your business actually works.",
        features: ["SaaS platforms", "Internal tooling", "Integrations", "Scalable APIs"],
        price: "$9,000",
        priceLabel: "Starting at",
    },
    {
        id: "ai-ml",
        icon: LuBrainCircuit,
        title: "AI & ML engineering",
        description: "Production-grade AI features — RAG, agents and model pipelines wired into real products.",
        features: ["LLM & RAG apps", "AI agents", "Vector search", "MLOps pipelines"],
        price: "$8,000",
        priceLabel: "Starting at",
    },
    {
        id: "ai-art",
        icon: LuPalette,
        title: "AI art & generative",
        description: "Striking AI-generated visuals, brand imagery and generative art directed with a human eye.",
        features: ["Brand & hero art", "Generative systems", "Model fine-tunes", "Asset pipelines"],
        price: "$2,000",
        priceLabel: "Starting at",
    },
    {
        id: "cloud-devops",
        icon: LuCloud,
        title: "Cloud & DevOps",
        description: "Resilient cloud architecture, CI/CD and observability that keeps products always-on.",
        features: ["AWS / GCP", "CI/CD pipelines", "IaC & Docker", "Monitoring"],
        price: "$4,000",
        priceLabel: "Starting at",
    },
];

// Hardcoded, not backed by the API. The prices and tier promises are
// unverified claims (flagged for the owner to confirm or remove).
const TIERS = [
    {
        name: "Essential",
        price: "$3,500",
        cadence: "per project",
        tagline: "For focused, single-scope builds.",
        features: ["1 product surface", "Up to 4 weeks", "Design + build", "2 revision rounds", "Email support"],
        popular: false,
    },
    {
        name: "Professional",
        price: "$8,500",
        cadence: "per project",
        tagline: "For ambitious products that need it all.",
        features: [
            "Multi-surface app",
            "Up to 10 weeks",
            "Design system included",
            "Unlimited revisions",
            "Priority Slack channel",
            "30 days post-launch support",
        ],
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        cadence: "retainer",
        tagline: "For ongoing scale and partnership.",
        features: ["Dedicated capacity", "Architecture & audits", "Team augmentation", "SLA & on-call", "Quarterly roadmapping"],
        popular: false,
    },
];

// ---------------------------------------------------------------------------
// API -> card mapping
// ---------------------------------------------------------------------------

const ICON_RULES: { test: RegExp; icon: IconType }[] = [
    { test: /\b(mobile|react native|ios|android|flutter|swift|kotlin|expo)\b/, icon: LuSmartphone },
    { test: /\b(ai|ml|llm|rag|machine learning|deep learning|nlp|agents?|openai|langchain|pytorch|tensorflow)\b/, icon: LuBrainCircuit },
    { test: /\b(generative|art|midjourney|stable diffusion|illustration|image generation)\b/, icon: LuPalette },
    { test: /\b(cloud|devops|aws|gcp|azure|docker|kubernetes|k8s|terraform|ci\/cd|infrastructure)\b/, icon: LuCloud },
    { test: /\b(ui|ux|design|figma|branding|prototyping)\b/, icon: LuPenTool },
    { test: /\b(saas|platform|integrations?|internal tools?|erp|crm)\b/, icon: LuLayers },
];

function iconFor(work: FreelanceWork): IconType {
    const haystack = [...work.skills, ...work.technologies].join(" ").toLowerCase();
    return ICON_RULES.find((rule) => rule.test.test(haystack))?.icon ?? LuCode;
}

function priceLabelFor(work: FreelanceWork): string {
    if (work.pricing_type === "hourly") return "Per hour";
    if (work.pricing_type === "monthly") return "Per month";
    return "Starting at";
}

/** The label already says "Per hour" / "Per month", so drop the API's unit suffix. */
function priceFor(work: FreelanceWork): string {
    const price = work.formatted_price ?? "";
    if (work.pricing_type === "hourly") return price.replace(/\s*\/\s*(hour|hr|h)\s*$/i, "");
    if (work.pricing_type === "monthly") return price.replace(/\s*\/\s*(month|mo)\s*$/i, "");
    return price;
}

function toServiceCard(work: FreelanceWork): ServiceCardData {
    return {
        id: work.slug || String(work.id),
        icon: iconFor(work),
        title: work.title,
        description: work.short_description || work.description || "",
        features: work.deliverables ?? [],
        price: priceFor(work),
        priceLabel: priceLabelFor(work),
    };
}

// ---------------------------------------------------------------------------

/**
 * Services and packages on the home page (replaces the old /freelance page).
 * Follows the admin's "Show services section" toggle.
 */
export default function Services() {
    const settings = usePublicSettings();
    const services = useApi<Paginated<FreelanceWork>>("/freelance/?page_size=100");

    // Active services from the admin, in the admin's order. Zero results or a
    // failed request fall back to the static list: this is marketing content,
    // so no error banner.
    const serviceCards = useMemo(() => {
        const active = (services.data?.items ?? [])
            .filter((w) => w.status === "active")
            .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
        return active.length > 0 ? active.map(toServiceCard) : FALLBACK_SERVICES;
    }, [services.data]);

    if (!settings.show_freelance) return null;

    return (
        <Box as="section" id="services" aria-labelledby="services-title" scrollMarginTop="24" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Stack gap="3" maxW="40rem" mb={{ base: "10", md: "12" }}>
                    <Heading
                        as="h2"
                        id="services-title"
                        textStyle="sectionTitle"
                        color="text.primary"
                        textDecorationLine="underline"
                        textDecorationColor="primary.500"
                        textDecorationThickness="3px"
                        textUnderlineOffset="7px"
                        css={{ textDecorationSkipInk: "none" }}
                    >
                        Services &amp; packages
                    </Heading>
                    <Text textStyle="lead" color="text.secondary">
                        Design and engineering work I take on, with fixed-price packages for common project sizes.
                    </Text>
                </Stack>

                <SimpleGrid as="ul" columns={{ base: 1, md: 2, lg: 3 }} gap="6">
                    {services.loading
                        ? [0, 1, 2].map((i) => (
                              <Box as="li" key={i}>
                                  <ServiceCardSkeleton />
                              </Box>
                          ))
                        : serviceCards.map((s) => (
                              <Box as="li" key={s.id}>
                                  <ServiceCard {...s} />
                              </Box>
                          ))}
                </SimpleGrid>

                <Stack id="pricing" scrollMarginTop="24" gap="2" maxW="40rem" mt={{ base: "16", md: "20" }} mb={{ base: "8", md: "10" }}>
                    <Heading as="h3" textStyle="cardTitle" color="text.primary">
                        Packages
                    </Heading>
                    <Text color="text.secondary">Fixed scope and price, or an ongoing retainer.</Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, lg: 3 }} gap="6" alignItems="stretch">
                    {TIERS.map((tier) => (
                        <PricingCard key={tier.name} {...tier} />
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Presentational sub-components
// ---------------------------------------------------------------------------

function ServiceCard({ icon: Icon, title, description, features, price, priceLabel }: ServiceCardData) {
    return (
        <Flex direction="column" h="full" p={{ base: "6", md: "8" }} css={card}>
            <Flex boxSize="11" align="center" justify="center" rounded="md" bg="primary.50" color="primary.600" mb="5" aria-hidden="true">
                <Icon size={20} />
            </Flex>

            <Heading as="h3" textStyle="cardTitle" color="text.primary" mb="2">
                {title}
            </Heading>
            {description && (
                <Text color="text.secondary" fontSize="sm" lineHeight="1.6" mb="5">
                    {description}
                </Text>
            )}

            {features.length > 0 && (
                <Stack as="ul" gap="2.5" mb="6">
                    {features.map((f) => (
                        <HStack as="li" key={f} gap="2.5" color="text.secondary" fontSize="sm" align="flex-start">
                            <Box color="primary.600" mt="0.5" flexShrink={0} aria-hidden="true">
                                <LuCheck size={16} />
                            </Box>
                            <Text>{f}</Text>
                        </HStack>
                    ))}
                </Stack>
            )}

            <Box borderTopWidth="1px" borderColor="border" pt="4" mt="auto">
                <Text textStyle="meta" color="text.muted">
                    {priceLabel}
                </Text>
                <Text fontSize="xl" fontWeight="600" color="text.primary" fontVariantNumeric="tabular-nums">
                    {price}
                </Text>
            </Box>
        </Flex>
    );
}

function ServiceCardSkeleton() {
    return (
        <Flex direction="column" h="full" p={{ base: "6", md: "8" }} css={card} aria-hidden="true">
            <Placeholder boxSize="11" mb="5" />
            <Placeholder h="6" w="60%" mb="3" />
            <Placeholder h="10" w="full" mb="5" />
            <Stack gap="2.5" mb="6">
                <Placeholder h="4" w="50%" />
                <Placeholder h="4" w="40%" />
            </Stack>
            <Box borderTopWidth="1px" borderColor="border" pt="4" mt="auto">
                <Placeholder h="4" w="20" mb="2" />
                <Placeholder h="7" w="24" />
            </Box>
        </Flex>
    );
}

function PricingCard({
    name,
    price,
    cadence,
    tagline,
    features,
    popular,
}: {
    name: string;
    price: string;
    cadence: string;
    tagline: string;
    features: string[];
    popular: boolean;
}) {
    return (
        <Flex
            direction="column"
            h="full"
            p={{ base: "6", md: "8" }}
            css={card}
            borderWidth={popular ? "1px" : undefined}
            borderColor={popular ? "primary.500" : undefined}
        >
            <HStack justify="space-between" align="center" mb="2">
                <Text textStyle="label" color="text.primary">
                    {name}
                </Text>
                {popular && (
                    <Text as="span" fontSize="xs" fontWeight="500" color="primary.700" bg="primary.50" px="2.5" py="1" rounded="md">
                        Most popular
                    </Text>
                )}
            </HStack>
            <Flex align="baseline" gap="2" mb="1">
                <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="600" color="text.primary" lineHeight="1.1" fontVariantNumeric="tabular-nums">
                    {price}
                </Text>
                <Text fontSize="sm" color="text.muted">
                    {cadence}
                </Text>
            </Flex>
            <Text color="text.secondary" fontSize="sm" mb="6">
                {tagline}
            </Text>

            <Stack as="ul" gap="3" mb="8" borderTopWidth="1px" borderColor="border" pt="6">
                {features.map((f) => (
                    <HStack as="li" key={f} gap="3" color="text.secondary" fontSize="sm" align="flex-start">
                        <Box color={popular ? "primary.600" : "text.muted"} mt="0.5" flexShrink={0} aria-hidden="true">
                            <LuCheck size={16} />
                        </Box>
                        <Text>{f}</Text>
                    </HStack>
                ))}
            </Stack>

            <Button asChild mt="auto" w="full" {...(popular ? primaryButton : secondaryButton)}>
                <a href="#contact">{price === "Custom" ? "Let's talk" : "Get started"}</a>
            </Button>
        </Flex>
    );
}
