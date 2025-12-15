'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../fishing.module.css';
import { CaughtFish } from '../hooks/useGameState';

interface AquariumProps {
    caughtFishes: CaughtFish[];
    totalCatches: number;
    hourlyIncome: number;
    pendingIncome: number;
    onCollect: () => number;
}

// Individual fish with smooth movement
interface SwimmingFish {
    id: string;
    x: number;
    y: number;
    targetX: number;
    speed: number;
    direction: number;
    emoji: string;
    size: number;
}

function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'common': return '#9CA3AF';
        case 'uncommon': return '#10B981';
        case 'rare': return '#3B82F6';
        case 'epic': return '#8B5CF6';
        case 'legendary': return '#F59E0B';
        default: return '#9CA3AF';
    }
}

function getRarityLabel(rarity: string): string {
    switch (rarity) {
        case 'common': return 'Common';
        case 'uncommon': return 'Uncommon';
        case 'rare': return 'Rare';
        case 'epic': return 'Epic';
        case 'legendary': return 'Legendary';
        default: return 'Common';
    }
}

export default function Aquarium({ caughtFishes, totalCatches, hourlyIncome, pendingIncome, onCollect }: AquariumProps) {
    const [collected, setCollected] = useState(false);
    const [fishes, setFishes] = useState<SwimmingFish[]>([]);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Initialize fish positions with CSS animation approach
    useEffect(() => {
        const tankFishes = caughtFishes.slice(0, 6);
        const initialFishes: SwimmingFish[] = tankFishes.map((cf, i) => {
            const startX = 10 + Math.random() * 80;
            const goingRight = Math.random() > 0.5;
            return {
                id: cf.id,
                x: startX,
                y: 15 + (i % 3) * 25 + Math.random() * 10,
                targetX: goingRight ? 90 : 10,
                speed: 0.02 + Math.random() * 0.02,
                direction: goingRight ? 1 : -1,
                emoji: cf.fish.emoji || '🐟',
                size: 20 + Math.random() * 6,
            };
        });
        setFishes(initialFishes);
    }, [caughtFishes]);

    // Smooth animation using requestAnimationFrame with delta time
    useEffect(() => {
        if (fishes.length === 0) return;

        const animate = (currentTime: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = currentTime;
            const deltaTime = currentTime - lastTimeRef.current;
            lastTimeRef.current = currentTime;

            setFishes(prevFishes => prevFishes.map(fish => {
                let { x, targetX, speed, direction } = fish;

                // Move towards target
                const moveAmount = speed * deltaTime * 0.1;

                if (direction === 1) {
                    x += moveAmount;
                    if (x >= 88) {
                        x = 88;
                        targetX = 10;
                        direction = -1;
                    }
                } else {
                    x -= moveAmount;
                    if (x <= 12) {
                        x = 12;
                        targetX = 90;
                        direction = 1;
                    }
                }

                return { ...fish, x, targetX, direction };
            }));

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            lastTimeRef.current = 0;
        };
    }, [fishes.length]);

    // Group fish by type for summary
    const fishSummary = caughtFishes.reduce((acc, cf) => {
        if (!acc[cf.fish.id]) {
            acc[cf.fish.id] = { fish: cf.fish, count: 0 };
        }
        acc[cf.fish.id].count++;
        return acc;
    }, {} as Record<string, { fish: typeof caughtFishes[0]['fish']; count: number }>);

    const uniqueTypes = Object.keys(fishSummary).length;

    const handleCollect = () => {
        if (pendingIncome > 0) {
            onCollect();
            setCollected(true);
            setTimeout(() => setCollected(false), 2000);
        }
    };

    return (
        <div className={styles.aquariumContainer}>
            {/* Income Card */}
            <div className={styles.incomeCard}>
                <div className={styles.incomeInfo}>
                    <div className={styles.incomeLabel}>Hourly Income</div>
                    <div className={styles.incomeValue}>🪙 {hourlyIncome}/hr</div>
                </div>
                <button
                    className={`${styles.collectBtn} ${pendingIncome <= 0 ? styles.disabled : ''} ${collected ? styles.collected : ''}`}
                    onClick={handleCollect}
                    disabled={pendingIncome <= 0}
                >
                    {collected ? '✓ Collected!' : `Collect +${pendingIncome}`}
                </button>
            </div>

            {/* Tank with CSS-based fish animation */}
            <div className={styles.tank}>
                <div className={styles.tankGlass}>
                    <div className={styles.tankWater}>
                        {/* Swimming fish with smooth CSS transitions */}
                        {fishes.map((fish) => (
                            <div
                                key={fish.id}
                                className={styles.smoothFish}
                                style={{
                                    left: `${fish.x}%`,
                                    top: `${fish.y}%`,
                                    fontSize: `${fish.size}px`,
                                    transform: `scaleX(${fish.direction})`,
                                }}
                            >
                                {fish.emoji}
                            </div>
                        ))}

                        {/* Static bubbles with CSS animation */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.tankBubble}
                                style={{ '--i': i } as React.CSSProperties}
                            />
                        ))}

                        {/* Decorations */}
                        <div className={styles.tankDecor}>
                            <div className={styles.coral} style={{ left: '10%' }}>🪸</div>
                            <div className={styles.plant} style={{ left: '30%' }}>🌿</div>
                            <div className={styles.coral} style={{ left: '55%' }}>🪸</div>
                            <div className={styles.plant} style={{ left: '75%' }}>🌿</div>
                        </div>

                        {/* Sand */}
                        <div className={styles.tankSand} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.aquaStats}>
                <div className={styles.aquaStat}>
                    <span className={styles.aquaStatNum}>{totalCatches}</span>
                    <span className={styles.aquaStatLabel}>Total</span>
                </div>
                <div className={styles.aquaStat}>
                    <span className={styles.aquaStatNum}>{uniqueTypes}</span>
                    <span className={styles.aquaStatLabel}>Species</span>
                </div>
                <div className={styles.aquaStat}>
                    <span className={styles.aquaStatNum}>{hourlyIncome}</span>
                    <span className={styles.aquaStatLabel}>🪙/hr</span>
                </div>
            </div>

            {/* Collection Summary */}
            <div className={styles.collection}>
                <h3 className={styles.collectionHead}>Collection</h3>

                {Object.keys(fishSummary).length === 0 ? (
                    <div className={styles.emptyMsg}>
                        <span>🎣</span>
                        <p>No fish yet</p>
                    </div>
                ) : (
                    <div className={styles.fishGrid}>
                        {Object.values(fishSummary).map(({ fish, count }) => (
                            <div key={fish.id} className={styles.fishItem}>
                                <div
                                    className={styles.fishIcon}
                                    style={{ background: `linear-gradient(135deg, ${fish.color}, ${fish.secondaryColor})` }}
                                >
                                    {fish.emoji || '🐟'}
                                </div>
                                <div className={styles.fishDetails}>
                                    <span className={styles.fishName}>{fish.name}</span>
                                    <span className={styles.fishRarity} style={{ color: getRarityColor(fish.rarity) }}>
                                        {getRarityLabel(fish.rarity)}
                                    </span>
                                </div>
                                <div className={styles.fishMeta}>
                                    <span className={styles.fishCount}>x{count}</span>
                                    <span className={styles.fishIncome}>🪙 {fish.hourlyIncome * count}/hr</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
