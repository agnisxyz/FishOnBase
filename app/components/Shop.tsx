'use client';

import React from 'react';
import styles from '../fishing.module.css';
import { UPGRADES, getUpgradeCost } from '../hooks/useGameState';

interface ShopProps {
    fishTokens: number;
    upgrades: Record<string, number>;
    onPurchase: (upgradeId: string) => boolean;
}

export default function Shop({ fishTokens, upgrades, onPurchase }: ShopProps) {
    const handlePurchase = (upgradeId: string) => {
        const success = onPurchase(upgradeId);
        if (success) {
            // Could add animation/sound here
        }
    };

    return (
        <div className={styles.shopContainer}>
            <div className={styles.shopHeader}>
                <h2 className={styles.shopTitle}>🛒 Mağaza</h2>
                <div className={styles.shopBalance}>
                    <span className={styles.shopBalanceIcon}>🪙</span>
                    <span className={styles.shopBalanceAmount}>{fishTokens.toLocaleString()}</span>
                </div>
            </div>

            <div className={styles.upgradeList}>
                {UPGRADES.map(upgrade => {
                    const currentLevel = upgrades[upgrade.id] || 0;
                    const isMaxed = currentLevel >= upgrade.maxLevel;
                    const cost = getUpgradeCost(upgrade, currentLevel);
                    const canAfford = fishTokens >= cost;

                    return (
                        <div
                            key={upgrade.id}
                            className={`${styles.upgradeCard} ${isMaxed ? styles.maxed : ''}`}
                        >
                            <div className={styles.upgradeIcon}>{upgrade.icon}</div>

                            <div className={styles.upgradeInfo}>
                                <div className={styles.upgradeName}>{upgrade.name}</div>
                                <div className={styles.upgradeDesc}>{upgrade.description}</div>
                                <div className={styles.upgradeLevel}>
                                    {[...Array(upgrade.maxLevel)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`${styles.levelDot} ${i < currentLevel ? styles.filled : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                className={`${styles.buyButton} ${!canAfford || isMaxed ? styles.disabled : ''}`}
                                onClick={() => handlePurchase(upgrade.id)}
                                disabled={!canAfford || isMaxed}
                            >
                                {isMaxed ? (
                                    <span className={styles.buyMaxed}>MAX</span>
                                ) : (
                                    <>
                                        <span className={styles.buyCost}>🪙 {cost}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className={styles.shopTip}>
                💡 Yükseltmeler balık tutmayı kolaylaştırır!
            </div>
        </div>
    );
}
