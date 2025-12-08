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

// Individual fish with realistic movement
interface SwimmingFish {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    direction: number; // 1 = right, -1 = left
    color: string;
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
        case 'common': return 'Yaygın';
        case 'uncommon': return 'Nadir';
        case 'rare': return 'Ender';
        case 'epic': return 'Destansı';
        case 'legendary': return 'Efsanevi';
        default: return 'Yaygın';
    }
}

export default function Aquarium({ caughtFishes, totalCatches, hourlyIncome, pendingIncome, onCollect }: AquariumProps) {
    const [collected, setCollected] = useState(false);
    const [fishes, setFishes] = useState<SwimmingFish[]>([]);
    const animationRef = useRef<number | null>(null);
    const tankRef = useRef<HTMLDivElement>(null);

    // Initialize fish positions
    useEffect(() => {
        const tankFishes = caughtFishes.slice(0, 8);
        const initialFishes: SwimmingFish[] = tankFishes.map((cf, i) => ({
            id: cf.id,
            x: 20 + Math.random() * 60,
            y: 15 + (i % 4) * 20 + Math.random() * 10,
            vx: (0.3 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
            vy: (Math.random() - 0.5) * 0.3,
            direction: Math.random() > 0.5 ? 1 : -1,
            color: cf.fish.color,
            size: 18 + Math.random() * 8,
        }));
        setFishes(initialFishes);
    }, [caughtFishes]);

    // Animate fish movement
    useEffect(() => {
        const animate = () => {
            setFishes(prevFishes => prevFishes.map(fish => {
                let { x, y, vx, vy, direction } = fish;

                // Update position
                x += vx;
                y += vy;

                // Random direction changes
                if (Math.random() < 0.02) {
                    vx += (Math.random() - 0.5) * 0.2;
                    vy += (Math.random() - 0.5) * 0.15;
                }

                // Clamp velocity
                vx = Math.max(-0.8, Math.min(0.8, vx));
                vy = Math.max(-0.3, Math.min(0.3, vy));

                // Bounce off walls
                if (x < 5) { x = 5; vx = Math.abs(vx); direction = 1; }
                if (x > 90) { x = 90; vx = -Math.abs(vx); direction = -1; }
                if (y < 10) { y = 10; vy = Math.abs(vy); }
                if (y > 85) { y = 85; vy = -Math.abs(vy); }

                // Update direction based on velocity
                if (vx > 0.1) direction = 1;
                else if (vx < -0.1) direction = -1;

                return { ...fish, x, y, vx, vy, direction };
            }));

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

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
                    <div className={styles.incomeLabel}>Saatlik Kazanç</div>
                    <div className={styles.incomeValue}>🪙 {hourlyIncome}/saat</div>
                </div>
                <button
                    className={`${styles.collectBtn} ${pendingIncome <= 0 ? styles.disabled : ''} ${collected ? styles.collected : ''}`}
                    onClick={handleCollect}
                    disabled={pendingIncome <= 0}
                >
                    {collected ? '✓ Alındı!' : `Topla +${pendingIncome}`}
                </button>
            </div>

            {/* Tank with realistic fish */}
            <div className={styles.tank} ref={tankRef}>
                <div className={styles.tankGlass}>
                    <div className={styles.tankWater}>
                        {/* Realistic swimming fish */}
                        {fishes.map((fish) => (
                            <div
                                key={fish.id}
                                className={styles.realisticFish}
                                style={{
                                    left: `${fish.x}%`,
                                    top: `${fish.y}%`,
                                    transform: `scaleX(${fish.direction})`,
                                    fontSize: `${fish.size}px`,
                                }}
                            >
                                <span role="img" aria-label="fish">🐟</span>
                            </div>
                        ))}

                        {/* Bubbles */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.tankBubble} style={{ '--i': i } as React.CSSProperties} />
                        ))}

                        {/* Decorations */}
                        <div className={styles.tankDecor}>
                            <div className={styles.coral} style={{ left: '10%' }}>🪸</div>
                            <div className={styles.plant} style={{ left: '30%' }}>🌿</div>
                            <div className={styles.coral} style={{ left: '55%' }}>🪸</div>
                            <div className={styles.plant} style={{ left: '75%' }}>🌿</div>
                            <div className={styles.coral} style={{ left: '90%' }}>🪸</div>
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
                    <span className={styles.aquaStatLabel}>Toplam</span>
                </div>
                <div className={styles.aquaStat}>
                    <span className={styles.aquaStatNum}>{uniqueTypes}</span>
                    <span className={styles.aquaStatLabel}>Tür</span>
                </div>
                <div className={styles.aquaStat}>
                    <span className={styles.aquaStatNum}>{hourlyIncome}</span>
                    <span className={styles.aquaStatLabel}>🪙/saat</span>
                </div>
            </div>

            {/* Collection Summary */}
            <div className={styles.collection}>
                <h3 className={styles.collectionHead}>Koleksiyon</h3>

                {Object.keys(fishSummary).length === 0 ? (
                    <div className={styles.emptyMsg}>
                        <span>🎣</span>
                        <p>Henüz balık yok</p>
                    </div>
                ) : (
                    <div className={styles.fishGrid}>
                        {Object.values(fishSummary).map(({ fish, count }) => (
                            <div key={fish.id} className={styles.fishItem}>
                                <div
                                    className={styles.fishIcon}
                                    style={{ background: `linear-gradient(135deg, ${fish.color}, ${fish.secondaryColor})` }}
                                >
                                    🐟
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
