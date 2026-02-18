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
    Center,
    SimpleGrid,
    Icon
} from "@chakra-ui/react";
import { LuPencil, LuStar } from "react-icons/lu";
import { MdStar, MdStarHalf } from "react-icons/md";

const Testimonials = () => {
    return (
        <Box as="section" id="testimonials" pb={24} pt={16}>
            {/* Header & Aggregate Stats Section */}
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={12} alignItems="center">
                    {/* Left: Title & Description */}
                    <VStack gridColumn={{ base: "span 1", lg: "span 5" }} align="flex-start" gap={6}>
                        <Box
                            display="inline-flex"
                            alignItems="center"
                            px={3}
                            py={1}
                            rounded="full"
                            bg="primary.500/10"
                            color="primary.500"
                            fontSize="xs"
                            fontWeight="semibold"
                            letterSpacing="wide"
                            textTransform="uppercase"
                        >
                            Client Success Stories
                        </Box>
                        <Heading fontSize={{ base: "4xl", md: "5xl" }} fontWeight="extrabold" letterSpacing="tight" color="text.primary">
                            Trusted by <Span color="primary.500">innovators</Span> worldwide.
                        </Heading>
                        <Text fontSize="lg" color="text.secondary" lineHeight="relaxed">
                            I partner with ambitious brands to build high-end digital products. Here is what my clients have to say about our collaboration.
                        </Text>
                        <Flex flexWrap="wrap" gap={4} pt={4}>
                            <Button
                                bg="slate.900"
                                _dark={{ bg: "white", color: "slate.900" }}
                                color="white"
                                px={6}
                                py={3}
                                h="auto"
                                rounded="lg"
                                fontWeight="medium"
                                _hover={{ opacity: 0.9 }}
                            >
                                <HStack gap={2}>
                                    <LuPencil size={16} />
                                    <Text>Submit a Review</Text>
                                </HStack>
                            </Button>
                            <HStack gap={1}>
                                {/* Company Logos stack */}
                                <Flex gap="-3" overflow="hidden" p={1}>
                                    <LogoAnchor alt="Stripe Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAEOrsEYV9CfwTxb6YEECrltu-bvKXkxFY4idJQdCUFEo7kRNW6e2EycjELQlOg2ySdF7OHlOKMI3mgaPYyw53vHrqYGpf6p-R94LZS4qjx55r9NsPomrMxKsHbkwZ047CgaRu9vh7qdthYd2GyYwupF-bEb5oPFamDu7BhMTgdK480IQ5TlU31h5ynizVDfJhWftTJoPyuzmNi1bpbiTxO7Fd6ffRGbr7rF84ZkY0_L5OU_RKb4cxT36cJpM5pWMHgpN17B_1dP0a" />
                                    <LogoAnchor alt="Airbnb Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5mn1yHA5eO8NL_MltBSwCEUlC-o0dB2_KaqI6vwfDXHDH-FSg-av_s1Vt2X7xcNHSPsWRtQxpjgbr8VAN_FtI9VbhXx65HRK4lYqHyu3k_1N0cyjBcMlWe8ZDFthI98l1d_u8vu3DLW-Gw3GHuuQ_dwxUJQVRcye9qJD70a0XZdh5Gs9u7XbMJxa9bttFftmJAzFVkwqHnqOG3zBIVYY-LfUggOlRD6N23JwoYyEk-gkEXze0X36wtT9UzWS73D0s8NYghfCDl0Ei" />
                                    <LogoAnchor alt="Shopify Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpoyKlKUy3psJVD8lL8azjWid0GgK6gfivRo9HQgapEfBlbkhqOKIXHrNhxUYBEaL2jE-HKGcx5YUyUlYn3473arkYfloKgNAKILHVzOHndfY4YcCrSQ4srVJxwuAT1rfL8cBDAJYAAMz1IrcTPB6xvLTusuPD9ZA7YKmJjx1Om1dWDiP7tDN5qAdzV3X9pwTUY14Q4hQYsEfCo29KPAzQSQ45xDMDlq4qPFtNjeAXT5J7baoYUDY9-WyCzMRtnhYbQnCYp2vKXjVA" />
                                    <LogoAnchor alt="Vercel Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTiweQ4ERquFEBObTqa_D828in67fqq_S2psLi9D1qZPAuGVxRIETFnnrlzWm7DRZTWpma8XGv5Vk20KlMds_X_0yN1_m5neUdXOshITXDrVNOmMZE6Sj-FcxnL8ExUETgk46KwOb2AwzXqb7YCHGLvQTm1QsiH0lYwqRViDg4bAE_ZrB9oUoUiFw4uvkUzGzfWwotQj5t7yA4LAddTvJCVx30fOGuoV26XohFVtIkMi03QAiM0uHhOolU6fbXxmOWXI7_fYpDdQZV" />
                                </Flex>
                                <Text fontSize="sm" fontWeight="medium" color="text.muted">and 20+ others</Text>
                            </HStack>
                        </Flex>
                    </VStack>

                    {/* Right: Rating Breakdown Card */}
                    <Box gridColumn={{ base: "span 1", lg: "span 7" }} bg="surface.light" _dark={{ bg: "slate.800", shadow: "none" }} rounded="2xl" p={8} shadow="xl" border="1px solid" borderColor="border.subtle">
                        <Flex flexDirection={{ base: "column", md: "row" }} gap={8} alignItems="center">
                            {/* Big Score */}
                            <Box textAlign={{ base: "center", md: "left" }} minW="140px">
                                <Text fontSize="6xl" fontWeight="black" color="text.primary" letterSpacing="tighter">4.9</Text>
                                <HStack color="amber.400" justify={{ base: "center", md: "flex-start" }} my={2}>
                                    <MdStar size={24} />
                                    <MdStar size={24} />
                                    <MdStar size={24} />
                                    <MdStar size={24} />
                                    <MdStarHalf size={24} />
                                </HStack>
                                <Text fontSize="sm" color="text.muted" fontWeight="medium">Based on 42 reviews</Text>
                            </Box>
                            {/* Progress Bars */}
                            <VStack gap={3} flexGrow={1} w="full">
                                <RatingBar stars={5} percentage={85} />
                                <RatingBar stars={4} percentage={12} />
                                <RatingBar stars={3} percentage={3} />
                                <RatingBar stars={2} percentage={0} />
                                <RatingBar stars={1} percentage={0} />
                            </VStack>
                        </Flex>
                    </Box>
                </Grid>
            </Container>

            {/* Featured Testimonial */}
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} mb={16} mt={16}>
                <Box position="relative" bgGradient="to-br" gradientFrom="primary.500" gradientTo="#0b4e9e" rounded="2xl" p={{ base: 8, md: 12 }} overflow="hidden" shadow="2xl" color="white" _dark={{ shadowColor: "transparent" }}>
                    {/* Decorative background patterns */}
                    <Box position="absolute" top="0" right="0" transform="translate(25%, -25%)" w="64" h="64" rounded="full" bg="white/10" filter="blur(64px)" />
                    <Box position="absolute" bottom="0" left="0" transform="translate(-25%, 25%)" w="40" h="40" rounded="full" bg="black/10" filter="blur(32px)" />
                    <Text position="absolute" top={8} left={8} fontSize="9xl" fontFamily="serif" color="white/10" lineHeight="none" userSelect="none">“</Text>

                    <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={{ base: 8, md: 12 }} alignItems={{ base: "center", md: "flex-start" }} position="relative" zIndex={10}>
                        <Box flexShrink={0}>
                            <Box position="relative" w={{ base: 32, md: 40 }} h={{ base: 32, md: 40 }}>
                                <Image alt="Sarah Jenkins Portrait" w="full" h="full" objectFit="cover" rounded="xl" border="4px solid" borderColor="white/20" shadow="lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrCTZsjPeMFZTX2Cwa0c_cWnI1ruj5UGx9JT4WswPBpn8OHqdktwjO-NbgQ1ghl4_tNqfXE62Rem-qsjsnMZvpXc_5CIbZh_HhbE2RYvgXUfWfxD-aEpf3cqduPPKEcy24RTMjj_p3e8dkJhFgVjGotlMCdCvcagV18rLUVTpC_NLPFs8ecey4Wj8TKCodjqg865X-FCivOq1wRSnKR_EeXm0gjJ-KsdyT0ZkSXwFHEUtn1Ybc68CRz43zmNLEYcr6ihIsnq7MaWM" />
                                <Box position="absolute" bottom="-3" right="-3" bg="white" p={2} rounded="lg" shadow="sm">
                                    <Image alt="Company Logo" w={6} h={6} objectFit="contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKOcscGH0p3IavTUAjzonI2_c2r86oCnphWk27NahVVGDrnaDBgqeys1ZKnQ0lEtsC95xQsfUGBoz4hUF0_ig1Sdq-tIJYmQ3R0CBJKFmDrzb1EV0ptMAJKSizWR6mBV-7MhsAQTpGmERsOYKP6StnoX7inABPxP9phYaReEBKQXvWe4OWiY_61A9JBgdkapItJDoKsosvJ1DQVrc0kL7uvwqtnt-hjddyMF8pDK4LImB0eWeU6lWO0jAkjBMU14L3GybnvxGAq16-" />
                                </Box>
                            </Box>
                        </Box>
                        <Box textAlign={{ base: "center", md: "left" }}>
                            <HStack justify={{ base: "center", md: "flex-start" }} gap={1} mb={4} color="amber.300">
                                <MdStar size={20} />
                                <MdStar size={20} />
                                <MdStar size={20} />
                                <MdStar size={20} />
                                <MdStar size={20} />
                            </HStack>
                            <Text as="blockquote" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="medium" lineHeight="relaxed" mb={6}>
                                "Victor didn't just write code; he architected a solution that scaled with our user base. His ability to bridge the gap between complex backend logic and beautiful UI is simply unmatched in the industry."
                            </Text>
                            <Box>
                                <Text fontWeight="bold" fontSize="lg">Sarah Jenkins</Text>
                                <Text color="white/90" fontSize="sm" fontWeight="medium">VP of Engineering at Spotify</Text>
                            </Box>
                        </Box>
                    </Grid>
                </Box>
            </Container>

            {/* Filters & Grid */}
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                {/* Toolbar */}
                <Flex flexDirection={{ base: "column", sm: "row" }} justify="space-between" align="center" mb={8} gap={4}>
                    <Heading as="h2" fontSize="xl" fontWeight="bold" color="text.primary">Recent Reviews</Heading>
                    <HStack gap={3}>
                        <Box position="relative">
                            <Box
                                as="select"
                                appearance="none"
                                bg="surface.light"
                                _dark={{ bg: "slate.800" }}
                                border="1px solid"
                                borderColor="border.DEFAULT"
                                color="text.secondary"
                                py={2}
                                pl={4}
                                pr={10}
                                rounded="lg"
                                fontSize="sm"
                                _focus={{ outline: "none", ring: "2", ringColor: "primary.500/50" }}
                                cursor="pointer"
                                shadow="sm"
                            >
                                <option>Most Recent</option>
                                <option>Highest Rated</option>
                                <option>Lowest Rated</option>
                            </Box>
                            <Center position="absolute" right={2} top="50%" transform="translateY(-50%)" color="text.muted" pointerEvents="none">
                                <Box as="span" className="material-icons" fontSize="lg">expand_more</Box>
                            </Center>
                        </Box>
                        <HStack bg="surface.light" _dark={{ bg: "slate.800" }} p={1} rounded="lg" border="1px solid" borderColor="border.DEFAULT" shadow="sm">
                            <Button size="xs" variant="ghost" bg="primary.500/10" color="primary.500" fontWeight="semibold" px={3} py={1.5}>All</Button>
                            <Button size="xs" variant="ghost" color="text.muted" fontWeight="medium" px={3} py={1.5} _hover={{ bg: "bg.muted" }}>Development</Button>
                            <Button size="xs" variant="ghost" color="text.muted" fontWeight="medium" px={3} py={1.5} _hover={{ bg: "bg.muted" }}>Design</Button>
                        </HStack>
                    </HStack>
                </Flex>

                {/* Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    <ReviewCard
                        name="David Chen"
                        role="Founder at StartUp Inc."
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCKI4gfNDdl3RqfRdpmPnKjHae35DWe7w7nxAjbfVktVWvkv1jIQxyvUKEWvA4-uZpnCfLZdvFrjEmmbDBx6RR39NlXMH_lGxvZ_db7cVoztWhb_hW-Zom58R307HT9iCOQ4eUpbO0TiW7TMNh-n3EiziTds2roXfUE68mx2qzbOCWB21p2QQAuhH4U3FWXivSUTxN5JgG1l1Da07ppIxsvJizYEmnQy-QJj3UrA0IK1fKwxdMt6VVxiFTtb3GGuKW81FbyHqDQO_J4"
                        text="Working with Victor was a breath of fresh air. He understood the brand guidelines immediately and translated them into a pixel-perfect React application. The animations are buttery smooth."
                        date="2 days ago"
                        stars={5}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuB0kfZoeXkp70Y_Kj9qhqXqQYc3mECmhNsYivQQQ-gIG7zLk7ET_ijxqEW1lGe-lmszx432BXe6Urc-V4QxsQWYl4PDNrb3RHW8Gq1BDZ1zTkHSPSDYGpAJdQrE93Q9bpIgnDCZAZ368t7KYk10aSNoF-bTzk2golCffXaw7Tb_jMRei89tYXvx8p5eGvLn0lpcVPNWkUanuLUVHiOaAfKVKYXaSk4gWhXOJ-ky9_zj5YEFUtKbZqvODqNwgfOkdyCQ_JPibZLvEjIf"
                    />
                    <ReviewCard
                        name="Emily Rossi"
                        role="CTO at FinEdge"
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDw3loR239CsSduh0POKAfNU3qnGZcBE091UIyCZ-nvkJRScZIF1RdI4_5x5fF5J5ic6rnTE9I_wUn34SVL71amH9ji2-0Lg_OKE39lBucjxpWBVZgKO3XwObGg5dQ5zKFXnftlHOxO9uPnYYdBnrCXngB7BKpilw8QeKBxJOTtMn6Yr_7mbJjGvjrpKUkuVmFO9UnwMmtizK0sSyqdLnOKvcRr6S4ZCJV8YN1FJat2TMh-c9ViqoXBCGWPM6rgrP-w4aUudmjyZU8B"
                        text="Exceptional delivery speed without compromising quality. The backend architecture he proposed saved us 30% on cloud costs. Highly recommended for complex integrations."
                        date="1 week ago"
                        stars={5}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuBtBsC8I5Jscl1E8Uea2BnNU8PBjYqILTl9NEL899dJniQk0oW99qm_LpwR9B6XCxDuAzcU5TnvsOD-Yg0x2YMxKMmzSgkngMW5Z0WVWWvklpefKvr0XqToeECuQOA41xwp-AhMp5v5GouXXz64ny5mKF-0bXIIQWQDnS68AXGJUDMfdl_0jQ_Ho6YFhMq8OZS7DZxmwJElxN8Ma0WzOPjhOnw0tW86Lh2iIvGgJx3mFZRNPEtFrh_niryT1DVReomJsfXmheC7PR8k"
                    />
                    <ReviewCard
                        name="Marcus Johnson"
                        role="Product Manager"
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuD3bfSXaWnKeDAWzxLWi4rIub__PobwuzwgfNpQkzryIuzX0dnbLOQnfuo-9RZDakF9-jl4tzgMIH_mbmM3fUBK-LtzkODWDQ3q_V3oM6FM_LZk9Ydj4e4h-jAIFf9TS-P1-IL4DHg-sQ1sY5hZcXFR2imj_-xdqxvesnORdwFcKwkAsPEvuQr4F2FaxL9L3VN8LdrNC6i88wA4ncl3ke9SJM_1gVm6v5fZX-47A08S2UZQzFvcqBDoWPyBGGL7-Q-whIs6da5bRfqC"
                        text="Victor is a rare find. A developer with a designer's eye. He caught several UX issues in our initial mockups that we missed. The final product is stunning."
                        date="2 weeks ago"
                        stars={4}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuAWCrUCa_s4YAXHnd2WnCDPS8o_oaBdErcnFBwLsjsqr4xPTvHYv7xdv-yShj0QOSo-EVt0UXW_y21l9m57rsCzxt7vMdBlykwaifCixb6SS3k3hEOxkJ3DL35hLOWVXhKuvLWLkM38vzhMkucJ1UGd-mA6E3TTZxmMA7ELSY2_Grjy6Ep037CEONuRQyTbMrayi1xHYCpJ5ZAYCULkdH5qS1GQmO4NeqiXHt_quikNFlJ6SIkulO0bmkN2-vYJyhJUFFGvsfV3xZXt"
                    />
                    <ReviewCard
                        name="Priya Patel"
                        role="Marketing Director"
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDTVAyQd4R4qVLAiYqlN6PpU4jIy7e8kOIAVVV7RwYBMhNI7nRjPIwcIzw_N0VID8hBcbvcAt5jwo2V8mfSlTKh6QuNzjgW92oXauvsQ_AgiwqFepWZgYkEJrkPmHd0ZTHy_roBxxuBlz1jKlJeJ4hTggSFMyIcD1C0iLIetASLRNkq_rEHuQLU2WxvqE7D-Fn1_09RHYP8goTPzOxaBKWLSkmahYaqgSV4z9JEjmehOD5EkGqZJT6sRiULpZ9KUw4-dW6BuVYf8haQ"
                        text="Our conversion rates increased by 40% after the redesign Victor implemented. He knows how to build high-performance sites that convert."
                        date="1 month ago"
                        stars={5}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuC011B_ef9AQM1Rkt9MQoDe66nm5XzDaUHPkMT1wMQBQiVWdAsTjH60f38ZNvm8XXfQkmYzj7_PtR4FhxYEihf1hCV2nJ-9hvE7dlcrku2O1juCk5w7UC7V0xonkCKA6zgbJ0D1YLImYYZgnsuKt3UDlcG-eea3YSyAb65_9XeayjdYsjlLQttbDO5QlF2QmBH91pJAKnKgFp2STunWJR19_7RQ3_F4U8dHjGlid5Rt-M9D8013gDKH8JsRS3Ub6eUYpbQqTyflqAFm"
                    />
                    <ReviewCard
                        name="James O'Connor"
                        role="CEO at GreenTech"
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuBbX2ALiSjlIEkvmYUTAqke3mTB79Oah-cODoowRM6NyKFFh6unmDHV3mgzWpDlChIR7mlU1J5exXqGZEol0gYn32ewnbFpLTT129K2rRUrWW9eeSbfoA3w1i1qf0lBUeLc8ugdnLND9mSu1KCDqZKJyYmKY50z2aE13zasBQ5_LqxeLxeR6fxeG1XxDH8cDijKqyDZV3Qe1Vce25lWnNuRdsroP07VZ-o-lY7YFOqCFwmb9PqqL2D9qmGMDKWE8MrN-GD-jNV6fERF"
                        text="I was impressed by his communication skills. Always kept me in the loop and explained technical challenges in plain English. A true professional."
                        date="2 months ago"
                        stars={5}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuBgr7ZdFl7tyQDI8G757kISBpHBQ7HBVhSjsYd-cWJNKBBWwQY5mYfgxpyt5DXj6clo2s8fXB44kPahfoU_PYf5ZZAycRjdu0kgVhC4TW05sPoHUnOz2aL7iwQ1eZ5UesKTVpmXpYLCxQKDamJQ_aYmsV2nL49TL573d2xB08mpbUFeXsGuN1AWsfpUgAopvnlBidVhhuMfcl88jMy9OT6p3BdPc_T44TqluCgrRdAGzjpAgydnBlq9xlZiiQ2B5p1feY79Fyi5g8ca"
                    />
                    <ReviewCard
                        name="Linda Wu"
                        role="Tech Lead"
                        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuA92PvfH8HwLSYJo1VFrS87DqtW8SIKeS0fYXK-Y09iYBMvtGEi_zoagtW7lWluAY0FKtHj6tZwjGjgcKSWLt-DL7MfTVUeoxjQPNu-s2l4-TLq2NKJaEcQt3XUeRlRNU6pb7LgvyRON7qeLuSQ_4-VRYN7m_26G3GGtunO7r6uIWJE34pTSW8SVdYq7UUpqRf1cXuvoNuTXx19_nllPeP97CWr3EzEyUXwZgPft_X-X3X8vZvapht3h6uWu-bMrudOHkN6ikUgJSQU"
                        text="Solid work on the API integration. There were a few hiccups with the third-party documentation, but Victor navigated them well. Good result overall."
                        date="3 months ago"
                        stars={4}
                        companyLogo="https://lh3.googleusercontent.com/aida-public/AB6AXuB_hxcRrfqqA4IyJibvMLpVkf-vvvf0rAEcr8ylZMIurN0a5HHuPzEx0_mM1ffN2FLPmIBdpUOEths_zeMXGenHt4s-zgYeQ0YXSmI_MeO6UhRl_98cEYzKclKWY7P7IGVqKclnDaOmvV-JtkaaA_jlfZYdBJJnTUxpHYp46R3w8O2BUtv6w3ycgBEj_mwAbMJ_JNfqNHQbaD8sZ1LZyi2Gnj3MLWQm8fKXs5GPCZNy0jegLRow3rwYWUimbXwgPSaTo7BsJadkEQUP"
                    />
                </SimpleGrid>

                <Box mt={12} textAlign="center">
                    <Button variant="outline" size="lg" rounded="lg" color="text.secondary" borderColor="border.DEFAULT" bg="surface.light" _dark={{ bg: "slate.800" }} _hover={{ bg: "bg.muted" }}>
                        Load More Reviews
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

const LogoAnchor = ({ alt, src }: { alt: string, src: string }) => (
    <Image
        alt={alt}
        boxSize={10}
        rounded="full"
        border="2px solid"
        borderColor="white"
        _dark={{ borderColor: "slate.900" }}
        bg="white"
        objectFit="contain"
        p={1}
        src={src}
    />
);

const RatingBar = ({ stars, percentage }: { stars: number, percentage: number }) => (
    <HStack gap={3} w="full" fontSize="sm">
        <Text w={3} fontWeight="bold" color="text.secondary">{stars}</Text>
        <Box flexGrow={1} h={2} bg="bg.muted" rounded="full" overflow="hidden">
            <Box h="full" bg="primary.500" rounded="full" style={{ width: `${percentage}%`, opacity: percentage < 20 ? 0.6 : 1 }} />
        </Box>
        <Text w={8} textAlign="right" color="text.muted">{percentage}%</Text>
    </HStack>
);

const ReviewCard = ({ name, role, avatar, text, date, stars, companyLogo }: { name: string, role: string, avatar: string, text: string, date: string, stars: number, companyLogo: string }) => (
    <VStack
        bg="surface.light"
        _dark={{ bg: "slate.800" }}
        p={6}
        rounded="xl"
        border="1px solid"
        borderColor="border.subtle"
        shadow="sm"
        _hover={{ shadow: "md" }}
        transition="shadow"
        align="stretch"
        h="full"
        gap={4}
    >
        <Flex justify="space-between" align="flex-start">
            <HStack gap={1} color="amber.400">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} as={MdStar} fontSize="base" color={i < stars ? "inherit" : "gray.300"} _dark={{ color: i < stars ? "inherit" : "gray.700" }} />
                ))}
            </HStack>
            <Text fontSize="xs" fontWeight="medium" color="text.muted">{date}</Text>
        </Flex>
        <Text color="text.secondary" fontSize="sm" lineHeight="relaxed" flexGrow={1}>
            "{text}"
        </Text>
        <HStack gap={3} pt={4} borderTop="1px solid" borderColor="border.subtle" align="center">
            <Image alt="Client Avatar" boxSize={10} rounded="full" objectFit="cover" src={avatar} />
            <Box>
                <Text fontSize="sm" fontWeight="bold" color="text.primary">{name}</Text>
                <Text fontSize="xs" color="text.muted">{role}</Text>
            </Box>
            <Image alt="Company" boxSize={5} ml="auto" opacity={0.5} filter="grayscale(100%)" _hover={{ filter: "none", opacity: 1 }} transition="all 0.3s" src={companyLogo} />
        </HStack>
    </VStack>
);

export default Testimonials;
