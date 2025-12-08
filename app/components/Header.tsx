'use client';

import React from 'react';
import styles from '../fishing.module.css';

interface HeaderProps {
    fishTokens: number;
    level: number;
    energy: number;
    maxEnergy: number;
    hourlyIncome: number;
    xpProgress: { current: number; required: number; percentage: number };
    levelUpAnimation: boolean;
    onAddTestGold?: () => void;
}

export default function Header({
    fishTokens,
    level,
    energy,
    maxEnergy,
    hourlyIncome,
    xpProgress,
    levelUpAnimation,
    onAddTestGold
}: HeaderProps) {
    return (
        <header className={styles.header}>
            {/* Level & XP */}
            <div className={styles.headerLeft}>
                <div className={`${styles.levelBadge} ${levelUpAnimation ? styles.levelUp : ''}`}>
                    <span className={styles.levelNumber}>Lv.{level}</span>
                </div>
                <div className={styles.xpContainer}>
                    <div className={styles.xpBar}>
                        <div
                            className={styles.xpFill}
                            style={{ width: `${xpProgress.percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Energy */}
            <div className={styles.energyDisplay}>
                <span className={styles.energyIcon}>⚡</span>
                <span className={styles.energyCount}>{energy}/{maxEnergy}</span>
            </div>

            {/* Test Button */}
            {onAddTestGold && (
                <button className={styles.testButton} onClick={onAddTestGold}>
                    +50🪙
                </button>
            )}

            {/* Tokens & Income */}
            <div className={styles.headerRight}>
                <div className={styles.tokenDisplay}>
                    <div className={styles.tokenMain}>
                        <span className={styles.tokenIcon}>🪙</span>
                        <span className={styles.tokenAmount}>{fishTokens.toLocaleString()}</span>
                    </div>
                    {hourlyIncome > 0 && (
                        <div className={styles.hourlyIncome}>
                            +{hourlyIncome}/hr
                        </div>
                    )}
                </div>
            </div>

            {/* Level Up Overlay */}
            {levelUpAnimation && (
                <div className={styles.levelUpOverlay}>
                    <div className={styles.levelUpContent}>
                        <span className={styles.levelUpText}>🎉 LEVEL UP!</span>
                        <span className={styles.levelUpNumber}>Level {level}</span>
                    </div>
                </div>
            )}
        </header>
    );
}
