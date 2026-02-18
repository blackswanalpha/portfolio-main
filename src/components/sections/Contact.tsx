"use client";

import {
    Box,
    Container,
    Grid,
    VStack,
    HStack,
    Text,
    Heading,
    Image,
    Span,
    Flex,
    Button,
    Input,
    Textarea,
    Separator,
    Center,
    Icon
} from "@chakra-ui/react";
import { LuMail, LuPhone, LuMapPin, LuLinkedin, LuGithub, LuTwitter, LuDribbble, LuSend, LuChevronDown } from "react-icons/lu";

const Contact = () => {
    return (
        <Box as="section" id="contact" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 12, lg: 20 }}>
            <Container maxW="7xl" p={0}>
                {/* Header Section */}
                <Box mb={16} maxW="2xl">
                    <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} fontWeight="bold" letterSpacing="tight" color="text.primary" mb={4}>
                        Let's start your <br />
                        <Span
                            className="text-transparent bg-clip-text"
                            bgGradient="to-r"
                            gradientFrom="primary.500"
                            gradientTo="blue.400"
                        >
                            next project.
                        </Span>
                    </Heading>
                    <Text fontSize="lg" color="text.muted" lineHeight="relaxed">
                        Interested in working together? Fill out the form below with some info about your project and I will get back to you as soon as I can. Please allow a couple of days for me to respond.
                    </Text>
                </Box>

                {/* Contact Section Wrapper */}
                <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 8, lg: 12 }} alignItems="flex-start">
                    {/* Left Column: Contact Info */}
                    <Box gridColumn={{ base: "span 1", lg: "span 4" }}>
                        <Flex flexDirection="column" gap={8} bg="surface.light" _dark={{ bg: "#13191f" }} p={8} rounded="2xl" shadow="sm" border="1px solid" borderColor="border.subtle" h="full" justify="space-between">
                            {/* Contact Details */}
                            <VStack gap={8} align="stretch">
                                <Box>
                                    <Heading as="h3" fontSize="xl" fontWeight="bold" color="text.primary" mb={6}>Get in Touch</Heading>
                                    {/* Detail Items */}
                                    <VStack gap={6} align="stretch">
                                        <ContactDetail icon={<LuMail />} label="Email Me" value="hello@victormbugua.com" href="mailto:hello@victormbugua.com" />
                                        <ContactDetail icon={<LuPhone />} label="Call Me" value="+1 (555) 000-0000" href="tel:+15550000000" />
                                        <ContactDetail icon={<LuMapPin />} label="Location" value="Nairobi, Kenya (Remote)" />
                                    </VStack>
                                </Box>
                                <Separator borderColor="border.subtle" />
                                {/* Social Media */}
                                <Box>
                                    <Text as="h4" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="text.muted" mb={4}>Connect</Text>
                                    <HStack gap={3}>
                                        <SocialLink icon={<LuLinkedin />} label="LinkedIn" />
                                        <SocialLink icon={<LuGithub />} label="GitHub" />
                                        <SocialLink icon={<LuTwitter />} label="Twitter" />
                                        <SocialLink icon={<LuDribbble />} label="Dribbble" />
                                    </HStack>
                                </Box>
                            </VStack>
                            {/* Map Visual (Abstract) */}
                            <Box h={32} w="full" rounded="xl" overflow="hidden" position="relative" border="1px solid" borderColor="border.subtle" mt={8}>
                                <Image alt="Abstract map" w="full" h="full" objectFit="cover" opacity={0.8} transition="transform 0.7s" _hover={{ transform: "scale(1.05)" }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1GoUfhn8PMA6JPC6yqo9Ktykz3srxVo_70zQcZPQLdyKLSK8ilLnIMNBb-e15VeEsnfxRT7kmbZaePVpl69s8ndMOdaWSgkKclCqKLrfOpbfxNTdmCPYF0wwTpUe9-HVpxHt5e-R4xq0Za39UFpQiKJdox_Hpr79Gqc9P0LBAqqvsxti4UjEEnKjqXxRhMwFVMSH2yinZopgPpgUSpiThr2K9FaR-bc2w8ItRal9CqLRbZDGIFwZcjzMLum3iv34HEdrZ86WtTmNJ" />
                                <Box position="absolute" inset={0} bg="primary.500/20" pointerEvents="none" />
                            </Box>
                        </Flex>
                    </Box>

                    {/* Right Column: Interactive Form */}
                    <Box gridColumn={{ base: "span 1", lg: "span 8" }}>
                        <Box className="glass-panel" rounded="2xl" p={{ base: 8, lg: 10 }} shadow="lg" position="relative" overflow="hidden" bg="glass.bg">
                            <Box position="absolute" top={0} left={0} w="full" h={1} bg="primary.500" />
                            <VStack as="form" gap={6} align="stretch">
                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                    <FormInput label="Full Name" placeholder="John Doe" />
                                    <FormInput label="Email Address" type="email" placeholder="john@example.com" />
                                </Grid>

                                <Box position="relative">
                                    <Text fontSize="sm" fontWeight="medium" color="text.secondary" mb={2}>What are you interested in?</Text>
                                    <Box position="relative">
                                        <Box
                                            as="select"
                                            defaultValue=""
                                            w="full"
                                            pl={4}
                                            pr={10}
                                            py={3}
                                            rounded="xl"
                                            bg="surface.light"
                                            _dark={{ bg: "#101822" }}
                                            border="1px solid"
                                            borderColor="border.DEFAULT"
                                            color="text.primary"
                                            appearance="none"
                                            _focus={{ outline: "none", ring: "2", ringColor: "primary.500", ringOffset: "0", borderColor: "transparent" }}
                                            transition="all 0.2s"
                                        >
                                            <option value="" disabled>Select an option</option>
                                            <option value="web-dev">Web Development</option>
                                            <option value="ui-design">UI/UX Design</option>
                                            <option value="full-stack">Full Stack Project</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="other">Other</option>
                                        </Box>
                                        <Center position="absolute" right={4} insetY={0} pointerEvents="none" color="text.muted">
                                            <LuChevronDown size={20} />
                                        </Center>
                                    </Box>
                                </Box>

                                <Box position="relative">
                                    <Text fontSize="sm" fontWeight="medium" color="text.secondary" mb={2}>Project Details</Text>
                                    <Textarea
                                        p={4}
                                        rounded="xl"
                                        bg="surface.light"
                                        _dark={{ bg: "#101822" }}
                                        border="1px solid"
                                        borderColor="border.DEFAULT"
                                        color="text.primary"
                                        placeholder="Tell me about your project, timeline, and budget..."
                                        rows={5}
                                        resize="none"
                                        _focus={{ outline: "none", ring: "2", ringColor: "primary.500", ringOffset: "0", borderColor: "transparent" }}
                                        transition="all 0.2s"
                                    />
                                </Box>

                                <Box pt={2}>
                                    <Button
                                        w={{ base: "full", md: "auto" }}
                                        display="inline-flex"
                                        px={8}
                                        py={4}
                                        h="auto"
                                        bg="primary.500"
                                        _hover={{ bg: "primary.600", shadow: "lg", transform: "translateY(-2px)" }}
                                        color="white"
                                        fontWeight="bold"
                                        rounded="xl"
                                        transition="all 0.2s"
                                        className="group"
                                    >
                                        <HStack gap={2}>
                                            <Text>Send Message</Text>
                                            <Icon as={LuSend} transition="transform 0.2s" _groupHover={{ transform: "translateX(4px)" }} />
                                        </HStack>
                                    </Button>
                                </Box>
                            </VStack>
                        </Box>
                    </Box>
                </Grid>

                {/* FAQ Section */}
                <Box mt={{ base: 20, lg: 32 }} maxW="4xl" mx="auto">
                    <Heading as="h2" fontSize="3xl" fontWeight="bold" color="text.primary" mb={8} textAlign="center">Frequently Asked Questions</Heading>
                    <VStack gap={4} align="stretch">
                        <FAQItem question="Are you currently available for freelance work?" answer="Yes, I am currently accepting new projects. My typical lead time for starting a new engagement is about 2 weeks. Please fill out the form above to discuss your project timeline." />
                        <FAQItem question="What is your typical hourly rate or project fee?" answer="Rates vary depending on the scope and complexity of the project. I offer both hourly rates for consultation and fixed-price packages for full builds. Generally, projects start from $2,500. Contact me for a detailed quote." />
                        <FAQItem question="Do you work with startups?" answer="Absolutely! I love the energy of startups. I specialize in helping early-stage companies build their MVP (Minimum Viable Product) and scalable design systems to help them secure funding or launch successfully." />
                        <FAQItem question="What tech stack do you use?" answer="For web applications, I primarily work with the MERN stack (MongoDB, Express, React, Node.js) or Next.js. For UI/UX design, I use Figma exclusively. I'm also proficient in Tailwind CSS for styling." />
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
};

const ContactDetail = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href?: string }) => {
    const content = (
        <HStack gap={4} align="flex-start" className="group" cursor={href ? "pointer" : "default"}>
            <Center boxSize={10} rounded="lg" bg="primary.500/10" color="primary.500" transition="all 0.3s" _groupHover={{ bg: "primary.500", color: "white" }}>
                {icon}
            </Center>
            <Box>
                <Text fontSize="sm" fontWeight="medium" color="text.muted">{label}</Text>
                <Text fontSize="base" fontWeight="semibold" color="text.primary" mt={1} transition="colors" _groupHover={{ color: "primary.500" }}>{value}</Text>
            </Box>
        </HStack>
    );

    return href ? (
        <a href={href} style={{ textDecoration: 'none' }}>
            {content}
        </a>
    ) : (
        <Box>{content}</Box>
    );
};

const SocialLink = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <Center
        as="a"
        href="#"
        aria-label={label}
        boxSize={10}
        rounded="full"
        border="1px solid"
        borderColor="border.DEFAULT"
        color="text.secondary"
        transition="all 0.3s"
        _hover={{ borderColor: "primary.500", color: "primary.500", bg: "primary.500/5" }}
    >
        {icon}
    </Center>
);

const FormInput = ({ label, type = "text", placeholder }: { label: string, type?: string, placeholder: string }) => (
    <Box>
        <Text fontSize="sm" fontWeight="medium" color="text.secondary" mb={2}>{label}</Text>
        <Input
            type={type}
            placeholder={placeholder}
            px={4}
            py={3}
            h="auto"
            rounded="xl"
            bg="surface.light"
            _dark={{ bg: "#101822" }}
            border="1px solid"
            borderColor="border.DEFAULT"
            color="text.primary"
            _focus={{ outline: "none", ring: "2", ringColor: "primary.500", ringOffset: "0", borderColor: "transparent" }}
            transition="all 0.2s"
        />
    </Box>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <Box
        as="details"
        className="group"
        bg="surface.light"
        _dark={{ bg: "#13191f" }}
        rounded="xl"
        border="1px solid"
        borderColor="border.subtle"
        shadow="sm"
        overflow="hidden"
        transition="all 0.3s"
        _open={{ shadow: "md" }}
    >
        <Box
            as="summary"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            cursor="pointer"
            p={6}
            listStyle="none"
            fontSize="lg"
            fontWeight="medium"
            color="text.primary"
            transition="colors"
            _hover={{ color: "primary.500" }}
        >
            <Text>{question}</Text>
            <Center transition="transform 0.3s" color="primary.500" _groupOpen={{ transform: "rotate(180deg)" }}>
                <LuChevronDown size={24} />
            </Center>
        </Box>
        <Box px={6} pb={6} color="text.secondary" lineHeight="relaxed">
            {answer}
        </Box>
    </Box>
);

export default Contact;
