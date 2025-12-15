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
        <header className={styles.headerBar}>
            {/* Left side - Level */}
            <div className={styles.headerSection}>
                <div className={`${styles.levelPill} ${levelUpAnimation ? styles.levelUpAnim : ''}`}>
                    <span className={styles.levelStar}>⭐</span>
                    <span className={styles.levelNum}>{level}</span>
                </div>
            </div>

            {/* Center - Energy */}
            <div className={styles.headerSection}>
                <div className={styles.energyPill}>
                    <span className={styles.energyBolt}>⚡</span>
                    <span className={styles.energyText}>{energy}/{maxEnergy}</span>
                </div>
            </div>

            {/* Right side - Tokens */}
            <div className={styles.headerSection}>
                {onAddTestGold && (
                    <button className={styles.testBtn} onClick={onAddTestGold}>+50</button>
                )}
                <div className={styles.tokenPill}>
                    <span className={styles.tokenCoin}>🪙</span>
                    <span className={styles.tokenNum}>{fishTokens.toLocaleString()}</span>
                </div>
            </div>

            {/* XP Bar - Bottom of header */}
            <div className={styles.xpBarFull}>
                <div className={styles.xpBarTrack}>
                    <div
                        className={styles.xpBarProgress}
                        style={{ width: `${xpProgress.percentage}%` }}
                    />
                </div>
            </div>

            {/* Level Up Overlay */}
            {levelUpAnimation && (
                <div className={styles.levelUpModal}>
                    <div className={styles.levelUpBox}>
                        <span className={styles.levelUpEmoji}>🎉</span>
                        <span className={styles.levelUpTitle}>LEVEL UP!</span>
                        <span className={styles.levelUpLevel}>Level {level}</span>
                    </div>
                </div>
            )}
        </header>
    );
}
