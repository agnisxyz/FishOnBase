'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from '../fishing.module.css';
import { FishType, getRandomFish } from '../hooks/useGameState';

interface FishingGameProps {
    level: number;
    energy: number;
    targetBonus: number;
    luckBonus: number;
    onCatch: (fish: FishType) => void;
}

type GameState = 'idle' | 'noEnergy' | 'casting' | 'waiting' | 'reeling' | 'success' | 'fail';

export default function FishingGame({ level, energy, targetBonus, luckBonus, onCatch }: FishingGameProps) {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [message, setMessage] = useState('');
    const [currentFish, setCurrentFish] = useState<FishType | null>(null);
    const [fishPosition, setFishPosition] = useState(50);
    const [catcherPosition, setCatcherPosition] = useState(50);
    const [catchProgress, setCatchProgress] = useState(0);
    const [rewardInfo, setRewardInfo] = useState<{ fish: FishType } | null>(null);
    const [bobberY, setBobberY] = useState(0);

    const fishMoveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasCaughtRef = useRef(false);
    const currentFishRef = useRef<FishType | null>(null);
    const fishPositionRef = useRef(50);
    const catcherPositionRef = useRef(50);
    const catchProgressRef = useRef(0);

    useEffect(() => {
        if (gameState === 'idle' && energy <= 0) setGameState('noEnergy');
        else if (gameState === 'noEnergy' && energy > 0) setGameState('idle');
    }, [energy, gameState]);

    useEffect(() => {
        return () => {
            if (fishMoveRef.current) clearInterval(fishMoveRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, []);

    // Bobber animation during waiting
    useEffect(() => {
        if (gameState === 'waiting') {
            const bobberInterval = setInterval(() => {
                setBobberY(Math.sin(Date.now() / 300) * 5);
            }, 50);
            return () => clearInterval(bobberInterval);
        }
    }, [gameState]);

    const clearIntervals = useCallback(() => {
        if (fishMoveRef.current) {
            clearInterval(fishMoveRef.current);
            fishMoveRef.current = null;
        }
        if (progressRef.current) {
            clearInterval(progressRef.current);
            progressRef.current = null;
        }
    }, []);

    const resetGame = useCallback(() => {
        setMessage('');
        setRewardInfo(null);
        setCurrentFish(null);
        currentFishRef.current = null;
        setCatchProgress(0);
        catchProgressRef.current = 0;
        setGameState(energy > 1 ? 'idle' : 'noEnergy');
        hasCaughtRef.current = false;
    }, [energy]);

    const handleCatchSuccess = useCallback((fish: FishType) => {
        clearIntervals();

        setGameState('success');
        setMessage(fish.name);
        setRewardInfo({ fish });

        // Call onCatch after a microtask to avoid setState during render
        setTimeout(() => {
            onCatch(fish);
        }, 0);

        setTimeout(() => {
            resetGame();
        }, 2000);
    }, [onCatch, clearIntervals, resetGame]);

    const handleCatchFail = useCallback(() => {
        clearIntervals();

        setGameState('fail');
        setMessage('Got away!');

        setTimeout(() => {
            resetGame();
        }, 1500);
    }, [clearIntervals, resetGame]);

    const startFishing = useCallback(() => {
        if (gameState !== 'idle' || energy <= 0) return;

        hasCaughtRef.current = false;
        setGameState('casting');

        // Cast animation
        setTimeout(() => {
            setGameState('waiting');

            // Wait for fish to bite
            const waitTime = 1000 + Math.random() * 2000;
            setTimeout(() => {
                const fish = getRandomFish(level, luckBonus);
                setCurrentFish(fish);
                currentFishRef.current = fish;

                fishPositionRef.current = 50;
                catcherPositionRef.current = 50;
                catchProgressRef.current = 50;

                setFishPosition(50);
                setCatcherPosition(50);
                setCatchProgress(50);
                setGameState('reeling');

                // Fish movement - random and erratic
                const fishSpeed = 1.5 + level * 0.1;
                let fishDirection = Math.random() > 0.5 ? 1 : -1;

                fishMoveRef.current = setInterval(() => {
                    // Random direction changes
                    if (Math.random() < 0.05) {
                        fishDirection *= -1;
                    }

                    let newPos = fishPositionRef.current + fishDirection * fishSpeed * (0.5 + Math.random());
                    if (newPos < 10) { newPos = 10; fishDirection = 1; }
                    if (newPos > 90) { newPos = 90; fishDirection = -1; }

                    fishPositionRef.current = newPos;
                    setFishPosition(newPos);
                }, 50);

                // Progress tracking - use refs to avoid nested setState
                progressRef.current = setInterval(() => {
                    const distance = Math.abs(fishPositionRef.current - catcherPositionRef.current);
                    const inZone = distance < 15;

                    let newProgress = catchProgressRef.current + (inZone ? 1.5 : -2);
                    newProgress = Math.max(0, Math.min(100, newProgress));

                    catchProgressRef.current = newProgress;
                    setCatchProgress(newProgress);

                    if (newProgress >= 100 && !hasCaughtRef.current && currentFishRef.current) {
                        hasCaughtRef.current = true;
                        handleCatchSuccess(currentFishRef.current);
                    } else if (newProgress <= 0 && !hasCaughtRef.current) {
                        hasCaughtRef.current = true;
                        handleCatchFail();
                    }
                }, 50);
            }, waitTime);
        }, 500);
    }, [gameState, energy, level, luckBonus, handleCatchSuccess, handleCatchFail]);

    const moveCatcher = useCallback((direction: 'up' | 'down') => {
        if (gameState !== 'reeling') return;

        const speed = 8;
        let newPos = catcherPositionRef.current + (direction === 'up' ? -speed : speed);
        newPos = Math.max(5, Math.min(95, newPos));

        catcherPositionRef.current = newPos;
        setCatcherPosition(newPos);
    }, [gameState]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (gameState !== 'reeling') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const newPos = Math.max(5, Math.min(95, y));

        catcherPositionRef.current = newPos;
        setCatcherPosition(newPos);
    }, [gameState]);

    return (
        <div className={styles.gameContainer}>
            {/* Ocean Scene */}
            <div className={styles.oceanScene}>
                {/* Sky gradient */}
                <div className={styles.skyGradient}>
                    <div className={styles.sunGlow} />
                </div>

                {/* Water */}
                <div className={styles.waterArea}>
                    <div className={styles.waterSurface} />

                    {/* Bobber */}
                    <div
                        className={`${styles.bobber} ${gameState === 'waiting' ? styles.bobberWaiting : ''} ${gameState === 'reeling' ? styles.bobberReeling : ''}`}
                        style={{ transform: `translateY(${bobberY}px)` }}
                    >
                        🎈
                    </div>

                    {/* Background fish */}
                    <div className={styles.bgFishArea}>
                        <span className={styles.bgFishSwim} style={{ '--delay': '0s', '--y': '30%' } as React.CSSProperties}>🐟</span>
                        <span className={styles.bgFishSwim} style={{ '--delay': '3s', '--y': '60%' } as React.CSSProperties}>🐠</span>
                        <span className={styles.bgFishSwim} style={{ '--delay': '6s', '--y': '80%' } as React.CSSProperties}>🐡</span>
                    </div>

                    {/* Bubbles */}
                    <div className={styles.bubbleContainer}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.bubble} style={{ '--i': i } as React.CSSProperties} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Fishing Rod UI */}
            <div className={styles.rodUI}>
                <div className={styles.rodHandle}>🎣</div>
            </div>

            {/* Game Controls */}
            {gameState === 'idle' && (
                <button className={styles.castButton} onClick={startFishing}>
                    <span className={styles.castIcon}>🎣</span>
                    <span className={styles.castText}>Cast Line</span>
                </button>
            )}

            {gameState === 'casting' && (
                <div className={styles.statusMessage}>
                    <span className={styles.castingAnim}>🎣</span>
                    <span>Casting...</span>
                </div>
            )}

            {gameState === 'waiting' && (
                <div className={styles.statusMessage}>
                    <span className={styles.waitingDots}>Waiting for a bite</span>
                </div>
            )}

            {/* Reeling Mini-game */}
            {gameState === 'reeling' && currentFish && (
                <div
                    className={styles.reelingGame}
                    onPointerMove={handlePointerMove}
                >
                    <div className={styles.reelingHeader}>
                        <span className={styles.fishEmoji}>{currentFish.emoji}</span>
                        <span className={styles.fishLabel}>{currentFish.name}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${catchProgress}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>{Math.round(catchProgress)}%</span>
                    </div>

                    {/* Catch Zone */}
                    <div className={styles.catchZoneContainer}>
                        <div className={styles.catchZoneTrack}>
                            {/* Fish indicator */}
                            <div
                                className={styles.fishIndicator}
                                style={{ top: `${fishPosition}%` }}
                            >
                                {currentFish.emoji}
                            </div>

                            {/* Catcher zone */}
                            <div
                                className={styles.catcherZone}
                                style={{ top: `${catcherPosition - 7.5}%` }}
                            />
                        </div>
                        <div className={styles.catchInstructions}>
                            Move to catch the fish!
                        </div>
                    </div>

                    {/* Touch controls */}
                    <div className={styles.touchControls}>
                        <button
                            className={styles.controlBtn}
                            onPointerDown={() => moveCatcher('up')}
                        >▲</button>
                        <button
                            className={styles.controlBtn}
                            onPointerDown={() => moveCatcher('down')}
                        >▼</button>
                    </div>
                </div>
            )}

            {/* Result */}
            {(gameState === 'success' || gameState === 'fail') && message && (
                <div className={`${styles.resultOverlay} ${gameState === 'success' ? styles.successOverlay : styles.failOverlay}`}>
                    <div className={styles.resultContent}>
                        <div className={styles.resultEmoji}>{gameState === 'success' ? '🎉' : '💨'}</div>
                        <div className={styles.resultMessage}>{message}</div>
                        {rewardInfo && (
                            <div className={styles.rewardBox}>
                                <span>🪙 +{rewardInfo.fish.fishToken}</span>
                                <span>⭐ +{rewardInfo.fish.xp} XP</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No energy */}
            {gameState === 'noEnergy' && (
                <div className={styles.noEnergyOverlay}>
                    <div className={styles.noEnergyBox}>
                        <span className={styles.noEnergyIcon}>⚡</span>
                        <span className={styles.noEnergyTitle}>Out of Energy!</span>
                        <span className={styles.noEnergySubtext}>Recharges in 10 min</span>
                    </div>
                </div>
            )}
        </div>
    );
}
