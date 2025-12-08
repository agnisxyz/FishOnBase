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

type GameState = 'idle' | 'noEnergy' | 'charging' | 'casting' | 'waiting' | 'catching' | 'success' | 'fail';

export default function FishingGame({ level, energy, targetBonus, luckBonus, onCatch }: FishingGameProps) {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [power, setPower] = useState(0);
    const [message, setMessage] = useState('');
    const [currentFish, setCurrentFish] = useState<FishType | null>(null);
    const [targetPosition, setTargetPosition] = useState(30);
    const [markerPosition, setMarkerPosition] = useState(0);
    const [lineLength, setLineLength] = useState(0);
    const [rewardInfo, setRewardInfo] = useState<{ fish: FishType } | null>(null);

    const powerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const markerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const markerDirectionRef = useRef(1);
    const hasCaughtRef = useRef(false);

    useEffect(() => {
        if (gameState === 'idle' && energy <= 0) setGameState('noEnergy');
        else if (gameState === 'noEnergy' && energy > 0) setGameState('idle');
    }, [energy, gameState]);

    useEffect(() => {
        return () => {
            if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
            if (markerIntervalRef.current) clearInterval(markerIntervalRef.current);
        };
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (gameState !== 'idle' || energy <= 0) return;
        e.preventDefault();
        setGameState('charging');
        setPower(0);
        hasCaughtRef.current = false;

        powerIntervalRef.current = setInterval(() => {
            setPower(prev => Math.min(prev + 2, 100));
        }, 30);
    }, [gameState, energy]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (gameState !== 'charging') return;
        e.preventDefault();

        if (powerIntervalRef.current) {
            clearInterval(powerIntervalRef.current);
            powerIntervalRef.current = null;
        }

        const currentPower = power;
        setGameState('casting');

        // Line length based on power
        const targetLine = 30 + (currentPower / 100) * 50;

        setTimeout(() => {
            setLineLength(targetLine);
            setGameState('waiting');

            const waitTime = 500 + Math.random() * (1500 - currentPower * 8);
            setTimeout(() => {
                const fish = getRandomFish(level, luckBonus);
                setCurrentFish(fish);
                setGameState('catching');

                const baseWidth = 20;
                const targetWidth = Math.max(12, baseWidth - level * 0.5 + targetBonus);
                setTargetPosition(10 + Math.random() * (75 - targetWidth));
                setMarkerPosition(0);
                markerDirectionRef.current = 1;

                // Simple setInterval for smoother animation
                const speed = 1.2 + level * 0.08;
                markerIntervalRef.current = setInterval(() => {
                    setMarkerPosition(prev => {
                        let next = prev + markerDirectionRef.current * speed;
                        if (next >= 100) { markerDirectionRef.current = -1; next = 100; }
                        else if (next <= 0) { markerDirectionRef.current = 1; next = 0; }
                        return next;
                    });
                }, 16);
            }, waitTime);
        }, 300);

        setPower(0);
    }, [gameState, power, level, targetBonus, luckBonus]);

    const handleCatchAttempt = useCallback(() => {
        if (gameState !== 'catching' || !currentFish || hasCaughtRef.current) return;
        hasCaughtRef.current = true;

        if (markerIntervalRef.current) {
            clearInterval(markerIntervalRef.current);
            markerIntervalRef.current = null;
        }

        const targetWidth = Math.max(12, 20 - level * 0.5 + targetBonus);
        const targetStart = targetPosition;
        const targetEnd = targetPosition + targetWidth;

        if (markerPosition >= targetStart && markerPosition <= targetEnd) {
            setGameState('success');
            setMessage(currentFish.name);
            setRewardInfo({ fish: currentFish });
            onCatch(currentFish);
        } else {
            setGameState('fail');
            setMessage('Kaçtı!');
        }

        setTimeout(() => {
            setMessage('');
            setRewardInfo(null);
            setGameState(energy > 1 ? 'idle' : 'noEnergy');
            setCurrentFish(null);
            setLineLength(0);
            hasCaughtRef.current = false;
        }, 1800);
    }, [gameState, targetPosition, markerPosition, currentFish, level, targetBonus, energy, onCatch]);

    const handleTap = useCallback(() => {
        if (gameState === 'catching') handleCatchAttempt();
    }, [gameState, handleCatchAttempt]);

    const targetWidth = Math.max(12, 20 - level * 0.5 + targetBonus);

    return (
        <div
            className={styles.fishingScene}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onClick={handleTap}
        >
            {/* Sky */}
            <div className={styles.sky}>
                <div className={styles.sun} />
                <div className={styles.clouds}>
                    <div className={styles.cloud} style={{ left: '10%', top: '20px' }} />
                    <div className={styles.cloud} style={{ left: '50%', top: '40px' }} />
                    <div className={styles.cloud} style={{ left: '80%', top: '15px' }} />
                </div>
            </div>

            {/* Sea */}
            <div className={styles.sea}>
                <div className={styles.seaWaves} />
                <div className={styles.seaBubbles}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={styles.seaBubble} style={{ '--i': i } as React.CSSProperties} />
                    ))}
                </div>

                {/* Fish swimming in background */}
                <div className={styles.bgFish}>
                    <span style={{ '--y': '20%', '--d': '12s', '--delay': '0s' } as React.CSSProperties}>🐟</span>
                    <span style={{ '--y': '50%', '--d': '15s', '--delay': '3s' } as React.CSSProperties}>🐠</span>
                    <span style={{ '--y': '75%', '--d': '10s', '--delay': '6s' } as React.CSSProperties}>🐡</span>
                </div>

                {/* Target fish when waiting/catching */}
                {(gameState === 'waiting' || gameState === 'catching') && currentFish && (
                    <div
                        className={styles.targetFish}
                        style={{
                            left: `${50 + lineLength * 0.6}%`,
                            top: '40%'
                        }}
                    >
                        🐟
                    </div>
                )}
            </div>

            {/* Fisherman on dock */}
            <div className={styles.dock}>
                <div className={styles.dockWood} />
                <div className={styles.fisherman}>
                    <div className={styles.fishermanBody}>
                        <div className={styles.hat}>🎩</div>
                        <div className={styles.face}>😊</div>
                        <div className={styles.body}>👕</div>
                    </div>
                    <div
                        className={`${styles.rod} ${gameState === 'charging' ? styles.rodCharge : ''} ${gameState === 'casting' ? styles.rodCast : ''}`}
                    >
                        <div className={styles.rodStick} />
                        {lineLength > 0 && (
                            <div
                                className={styles.fishingLine}
                                style={{ width: `${lineLength * 2}px` }}
                            >
                                <span className={styles.hook}>🪝</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Power Bar */}
            <div className={`${styles.powerBar} ${gameState === 'charging' ? styles.show : ''}`}>
                <div className={styles.powerFill} style={{ width: `${power}%` }} />
                <span className={styles.powerText}>{Math.round(power)}%</span>
            </div>

            {/* Catch Mini-game */}
            {gameState === 'catching' && (
                <div className={styles.catchOverlay} onClick={handleCatchAttempt}>
                    <div className={styles.catchModal}>
                        <div className={styles.catchHeader}>🐟 Çek!</div>
                        <div className={styles.catchBarContainer}>
                            <div className={styles.catchBarBg}>
                                <div
                                    className={styles.catchZone}
                                    style={{ left: `${targetPosition}%`, width: `${targetWidth}%` }}
                                />
                                <div
                                    className={styles.catchPointer}
                                    style={{ left: `${markerPosition}%` }}
                                />
                            </div>
                        </div>
                        <div className={styles.catchTip}>Yeşil alanda dokun!</div>
                    </div>
                </div>
            )}

            {/* Result */}
            {message && (
                <div className={`${styles.resultPopup} ${gameState === 'success' ? styles.resultSuccess : styles.resultFail}`}>
                    <div className={styles.resultEmoji}>{gameState === 'success' ? '🎉' : '💨'}</div>
                    <div className={styles.resultText}>{message}</div>
                    {rewardInfo && (
                        <div className={styles.resultRewards}>
                            <span>🪙 +{rewardInfo.fish.fishToken}</span>
                            <span>⭐ +{rewardInfo.fish.xp} XP</span>
                        </div>
                    )}
                </div>
            )}

            {/* Idle prompt */}
            {gameState === 'idle' && (
                <div className={styles.idleHint}>
                    <span className={styles.hintIcon}>👆</span>
                    <span>Basılı tut ve bırak</span>
                </div>
            )}

            {/* No energy */}
            {gameState === 'noEnergy' && (
                <div className={styles.noEnergyMsg}>
                    <span>⚡</span>
                    <span>Enerji bitti!</span>
                    <small>10 dk bekle</small>
                </div>
            )}
        </div>
    );
}
