"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  sublabel?: string;
}

const MotionBox = motion.create(Box);

export default function StatCard({ icon, value, label, sublabel }: StatCardProps) {
  return (
    <MotionBox
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Box
        position="relative"
        p={6}
        borderRadius="2xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        _hover={{
          borderColor: "rgba(59, 130, 246, 0.3)",
          "& .icon-container": {
            color: "blue.400",
          },
        }}
        transition="all 0.3s ease"
      >
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box
            className="icon-container"
            color="gray.400"
            transition="color 0.3s ease"
          >
            {icon}
          </Box>
          <Text
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            color="white"
            lineHeight="1"
          >
            {value}
          </Text>
        </Flex>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color="white" mb={1}>
            {label}
          </Text>
          {sublabel && (
            <Text fontSize="xs" color="gray.400">
              {sublabel}
            </Text>
          )}
        </Box>

        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius="2xl"
          bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
          opacity={0}
          _hover={{ opacity: 1 }}
          transition="opacity 0.3s ease"
          pointerEvents="none"
        />
      </Box>
    </MotionBox>
  );
}