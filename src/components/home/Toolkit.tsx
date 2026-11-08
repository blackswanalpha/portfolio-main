"use client";

import type { IconType } from "react-icons";
import { Box, Container, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import {
    SiBlender,
    SiChakraui,
    SiDavinciresolve,
    SiDocker,
    SiElevenlabs,
    SiExpress,
    SiFastapi,
    SiFigma,
    SiFramer,
    SiGithub,
    SiGithubactions,
    SiGooglecloud,
    SiGooglegemini,
    SiGreensock,
    SiHuggingface,
    SiJavascript,
    SiLangchain,
    SiLinux,
    SiMongodb,
    SiNextdotjs,
    SiNodedotjs,
    SiPostgresql,
    SiPytest,
    SiPython,
    SiPytorch,
    SiReact,
    SiRedis,
    SiSqlalchemy,
    SiSuno,
    SiTailwindcss,
    SiTerraform,
    SiThreedotjs,
    SiTypescript,
} from "react-icons/si";
import {
    AfterEffectsLogo,
    AwsLogo,
    CanvaLogo,
    IllustratorLogo,
    LightroomLogo,
    OpenAiLogo,
    PhotoshopLogo,
    PremiereProLogo,
} from "@/components/icons/brandLogos";

interface Tool {
    label: string;
    Icon: IconType;
    /** Brand colour. Left out for brands whose mark is black, which follow text.primary. */
    color?: string;
}

// Owner's list, verbatim: the original 14, then the 16 added in November 2026.
const DEVELOPMENT: Tool[] = [
    { label: "React", Icon: SiReact, color: "#61DAFB" },
    { label: "Next.js", Icon: SiNextdotjs },
    { label: "Node.js", Icon: SiNodedotjs, color: "#5FA04E" },
    { label: "Express", Icon: SiExpress },
    { label: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
    { label: "MongoDB", Icon: SiMongodb, color: "#47A248" },
    { label: "Python", Icon: SiPython, color: "#3776AB" },
    { label: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
    { label: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
    { label: "FastAPI", Icon: SiFastapi, color: "#009688" },
    { label: "Docker", Icon: SiDocker, color: "#2496ED" },
    { label: "Git & GitHub", Icon: SiGithub },
    { label: "GSAP", Icon: SiGreensock, color: "#88CE02" },
    { label: "Three.js", Icon: SiThreedotjs },
    { label: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
    { label: "React Native", Icon: SiReact, color: "#61DAFB" },
    { label: "Chakra UI", Icon: SiChakraui, color: "#319795" },
    { label: "Redis", Icon: SiRedis, color: "#FF4438" },
    { label: "SQLAlchemy", Icon: SiSqlalchemy, color: "#D71F00" },
    { label: "Pytest", Icon: SiPytest, color: "#0A9EDC" },
    { label: "AWS", Icon: AwsLogo, color: "#FF9900" },
    { label: "Google Cloud", Icon: SiGooglecloud, color: "#4285F4" },
    { label: "GitHub Actions", Icon: SiGithubactions, color: "#2088FF" },
    { label: "Terraform", Icon: SiTerraform, color: "#844FBA" },
    { label: "Linux", Icon: SiLinux },
    { label: "PyTorch", Icon: SiPytorch, color: "#EE4C2C" },
    { label: "Hugging Face", Icon: SiHuggingface, color: "#FFD21E" },
    { label: "LangChain", Icon: SiLangchain, color: "#1C3C3C" },
    { label: "OpenAI", Icon: OpenAiLogo },
    { label: "Google Gemini", Icon: SiGooglegemini, color: "#8E75B2" },
];

const DESIGN: Tool[] = [
    { label: "Figma", Icon: SiFigma, color: "#F24E1E" },
    { label: "Photoshop", Icon: PhotoshopLogo, color: "#31A8FF" },
    { label: "Illustrator", Icon: IllustratorLogo, color: "#FF9A00" },
    { label: "Blender", Icon: SiBlender, color: "#E87D0D" },
    { label: "Canva", Icon: CanvaLogo, color: "#00C4CC" },
    { label: "After Effects", Icon: AfterEffectsLogo, color: "#9999FF" },
    { label: "Premiere Pro", Icon: PremiereProLogo, color: "#9999FF" },
    { label: "DaVinci Resolve", Icon: SiDavinciresolve, color: "#233A51" },
    { label: "Lightroom", Icon: LightroomLogo, color: "#31A8FF" },
    { label: "Framer", Icon: SiFramer, color: "#0055FF" },
    { label: "Suno", Icon: SiSuno },
    { label: "ElevenLabs", Icon: SiElevenlabs },
];

/**
 * Equal-width cells in a wrapping grid: two columns at 320px, five on desktop.
 * Brand marks render in their brand colour; black marks use text.primary.
 */
function ToolGrid({ title, tools }: { title: string; tools: Tool[] }) {
    return (
        <Box>
            <Heading as="h3" textStyle="label" color="text.primary" mb="3">
                {title}
            </Heading>
            <Grid as="ul" templateColumns="repeat(auto-fill, minmax(8.5rem, 1fr))" gap="2" listStyleType="none">
                {tools.map(({ label, Icon, color }) => (
                    <HStack
                        as="li"
                        key={label}
                        gap="2.5"
                        minH="10"
                        px="3"
                        py="2"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="border"
                        bg="surface"
                        color="text.secondary"
                        minW="0"
                    >
                        <Box as="span" display="inline-flex" flexShrink={0} color={color ?? "text.primary"} aria-hidden="true">
                            <Icon size={15} />
                        </Box>
                        <Text as="span" textStyle="label" fontWeight="400" lineHeight="1.25" minW="0">
                            {label}
                        </Text>
                    </HStack>
                ))}
            </Grid>
        </Box>
    );
}

export default function Toolkit() {
    return (
        <Box as="section" aria-labelledby="toolkit-title" py={{ base: "12", lg: "16" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 4fr) minmax(0, 8fr)" }}
                    gap={{ base: "8", lg: "16" }}
                >
                    <Stack gap="4" minW="0">
                        <Heading as="h2" id="toolkit-title" textStyle="sectionTitle" color="text.primary">
                            Tools I use
                        </Heading>
                        <Text textStyle="body" color="text.secondary" maxW="28rem">
                            What I reach for when I build and when I design.
                        </Text>
                    </Stack>
                    <Stack gap="8" minW="0">
                        <ToolGrid title="Development stack" tools={DEVELOPMENT} />
                        <ToolGrid title="Design and tools" tools={DESIGN} />
                    </Stack>
                </Grid>
            </Container>
        </Box>
    );
}
