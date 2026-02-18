"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const AnimatedSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Subtle rotation
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
                <MeshDistortMaterial
                    color="#2e6eb8" // primary.500
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.4}
                    metalness={0.8}
                    wireframe={false}
                    transparent
                    opacity={0.3}
                />
            </Sphere>
        </Float>
    );
};

const Hero3DBackground = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#4fd1c5" />
                <directionalLight position={[-10, -10, -5]} intensity={2} color="#2e6eb8" />
                <AnimatedSphere />
            </Canvas>
        </div>
    );
};

export default Hero3DBackground;
