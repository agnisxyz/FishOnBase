'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../fishing.module.css';

interface IntroScreenProps {
    onStart: () => void;
}

// Fish types for natural variety
const FISH_TYPES = ['🐟', '🐠', '🐡', '🦈', '🐙', '🐳', '🐬'];

interface SwimmingFish {
    id: number;
    emoji: string;
    x: number;
    y: number;
    vx: number;
    size: number;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
    const [fishes, setFishes] = useState<SwimmingFish[]>([]);
    const animationRef = useRef<number | null>(null);

    // Initialize FEWER fish (6) in TOP and BOTTOM areas only
    useEffect(() => {
        const initialFishes: SwimmingFish[] = Array.from({ length: 6 }, (_, i) => {
            const goingRight = Math.random() > 0.5;
            // Fish only in top 20% or bottom 20% of screen
            const isTop = i < 3;
            const yPosition = isTop
                ? 5 + Math.random() * 15  // Top area: 5-20%
                : 80 + Math.random() * 15; // Bottom area: 80-95%

            return {
                id: i,
                emoji: FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)],
                x: Math.random() * 100,
                y: yPosition,
                vx: (0.12 + Math.random() * 0.2) * (goingRight ? 1 : -1),
                size: 20 + Math.random() * 14,
            };
        });
        setFishes(initialFishes);
    }, []);

    // Smooth fish animation
    useEffect(() => {
        const animate = () => {
            setFishes(prev => prev.map(fish => {
                let { x, vx } = fish;

                x += vx;

                if (x < -5) {
                    x = -5;
                    vx = Math.abs(vx);
                } else if (x > 105) {
                    x = 105;
                    vx = -Math.abs(vx);
                }

                if (Math.random() < 0.008) {
                    vx += (Math.random() - 0.5) * 0.02;
                    vx = Math.max(-0.35, Math.min(0.35, vx));
                    if (Math.abs(vx) < 0.05) vx = 0.1 * (vx >= 0 ? 1 : -1);
                }

                return { ...fish, x, vx };
            }));

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div className={styles.introScreen}>
            {/* Animated Ocean Background */}
            <div className={styles.introBg}>
                {/* Light rays from top */}
                <div className={styles.lightRays}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={styles.lightRay} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                </div>

                {/* Waves */}
                <div className={styles.introWaves}>
                    <div className={styles.introWave} />
                    <div className={styles.introWave} />
                    <div className={styles.introWave} />
                </div>

                {/* Soft Bubbles */}
                <div className={styles.introBubbles}>
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={styles.introBubble} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                </div>

                {/* Swimming Fish - TOP and BOTTOM areas only */}
                <div className={styles.introFishContainer}>
                    {fishes.map((fish) => (
                        <div
                            key={fish.id}
                            className={styles.introSwimFish}
                            style={{
                                left: `${fish.x}%`,
                                top: `${fish.y}%`,
                                fontSize: `${fish.size}px`,
                                transform: fish.vx > 0 ? 'scaleX(-1)' : 'scaleX(1)',
                            }}
                        >
                            {fish.emoji}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className={styles.introContent}>
                <div className={styles.introLogo}>
                    <span className={styles.introEmoji}>🎣</span>
                    <h1 className={styles.introTitle}>FishOnBase</h1>
                    <p className={styles.introSubtitle}>Balık tut, token kazan!</p>
                </div>

                <div className={styles.introFeatures}>
                    <div className={styles.introFeature}>
                        <span className={styles.featureIcon}>🐟</span>
                        <span className={styles.featureText}>7 Balık Türü</span>
                    </div>
                    <div className={styles.introFeature}>
                        <span className={styles.featureIcon}>🪙</span>
                        <span className={styles.featureText}>FISH Token</span>
                    </div>
                    <div className={styles.introFeature}>
                        <span className={styles.featureIcon}>🛒</span>
                        <span className={styles.featureText}>Yükseltmeler</span>
                    </div>
                </div>

                {/* START BUTTON */}
                <button className={styles.introButton} onClick={onStart}>
                    <span className={styles.introButtonText}>Başla</span>
                    <span className={styles.introButtonIcon}>→</span>
                </button>
            </div>
        </div>
    );
}
