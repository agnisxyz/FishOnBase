'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Fish type definition
export interface FishType {
    id: string;
    name: string;
    color: string;
    secondaryColor: string;
    fishToken: number;
    xp: number;
    hourlyIncome: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    emoji: string;
}

// Caught fish with timestamp
export interface CaughtFish {
    id: string;
    fish: FishType;
    caughtAt: number;
}

// Upgrade definitions
export interface Upgrade {
    id: string;
    name: string;
    description: string;
    icon: string;
    maxLevel: number;
    baseCost: number;
    costMultiplier: number;
    effect: number; // Effect per level
}

// Game state interface
export interface GameState {
    fishTokens: number;
    xp: number;
    level: number;
    energy: number;
    maxEnergy: number;
    lastEnergyRefill: number;
    caughtFishes: CaughtFish[];
    totalCatches: number;
    upgrades: Record<string, number>; // upgradeId -> level
    lastIncomeCollect: number;
}

// Fish types with rewards and hourly income - each with unique emoji
export const FISH_TYPES: FishType[] = [
    { id: 'goldfish', name: 'Goldfish', color: '#FFD700', secondaryColor: '#FFA500', fishToken: 5, xp: 10, hourlyIncome: 1, rarity: 'common', emoji: '🐟' },
    { id: 'clownfish', name: 'Clownfish', color: '#FF6B6B', secondaryColor: '#FF8E53', fishToken: 8, xp: 15, hourlyIncome: 2, rarity: 'common', emoji: '🐠' },
    { id: 'salmon', name: 'Salmon', color: '#FA8072', secondaryColor: '#E9967A', fishToken: 15, xp: 25, hourlyIncome: 4, rarity: 'uncommon', emoji: '🐡' },
    { id: 'tropical', name: 'Tropical', color: '#9B59B6', secondaryColor: '#8E44AD', fishToken: 20, xp: 35, hourlyIncome: 6, rarity: 'rare', emoji: '🦑' },
    { id: 'tuna', name: 'Tuna', color: '#4682B4', secondaryColor: '#5F9EA0', fishToken: 30, xp: 50, hourlyIncome: 10, rarity: 'rare', emoji: '🦐' },
    { id: 'angelfish', name: 'Angelfish', color: '#00CED1', secondaryColor: '#20B2AA', fishToken: 45, xp: 75, hourlyIncome: 15, rarity: 'epic', emoji: '🐬' },
    { id: 'swordfish', name: 'Swordfish', color: '#4169E1', secondaryColor: '#1E90FF', fishToken: 75, xp: 120, hourlyIncome: 25, rarity: 'legendary', emoji: '🦈' },
];

// Upgrade definitions - English
export const UPGRADES: Upgrade[] = [
    {
        id: 'betterRod',
        name: 'Power Rod',
        description: 'Target zone +15% larger',
        icon: '🎣',
        maxLevel: 5,
        baseCost: 50,
        costMultiplier: 2,
        effect: 15
    },
    {
        id: 'luckyCharm',
        name: 'Lucky Charm',
        description: 'Rare fish chance +10%',
        icon: '🍀',
        maxLevel: 5,
        baseCost: 100,
        costMultiplier: 2.5,
        effect: 10
    },
    {
        id: 'energyBoost',
        name: 'Energy Boost',
        description: 'Max energy +2',
        icon: '⚡',
        maxLevel: 5,
        baseCost: 75,
        costMultiplier: 2,
        effect: 2
    },
    {
        id: 'fastRecharge',
        name: 'Fast Recharge',
        description: 'Energy refills 20% faster',
        icon: '🔋',
        maxLevel: 5,
        baseCost: 80,
        costMultiplier: 2,
        effect: 20
    },
];

// Constants
const BASE_ENERGY = 5;
const ENERGY_REFILL_TIME = 10 * 60 * 1000; // 10 minutes per energy

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 350, 850, 1850, 3500, 6000, 10000, 16000, 25000];

// Calculate level from XP
export function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
}

// Get XP progress for current level
export function getLevelProgress(xp: number): { current: number; required: number; percentage: number } {
    const level = calculateLevel(xp);
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const current = xp - currentThreshold;
    const required = nextThreshold - currentThreshold;
    return { current, required, percentage: Math.min((current / required) * 100, 100) };
}

// Get random fish based on level and luck upgrade
export function getRandomFish(level: number, luckBonus: number = 0): FishType {
    const weights: Record<string, number> = {
        common: Math.max(40 - level * 3 - luckBonus, 10),
        uncommon: 30,
        rare: 15 + level * 1.5 + luckBonus * 0.5,
        epic: 4 + level * 0.8 + luckBonus * 0.3,
        legendary: 1 + level * 0.5 + luckBonus * 0.2,
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + Math.max(b, 0), 0);
    let random = Math.random() * totalWeight;

    let selectedRarity: string = 'common';
    for (const [rarity, weight] of Object.entries(weights)) {
        random -= Math.max(weight, 0);
        if (random <= 0) { selectedRarity = rarity; break; }
    }

    const fishOfRarity = FISH_TYPES.filter(f => f.rarity === selectedRarity);
    return fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)] || FISH_TYPES[0];
}

// Get upgrade cost
export function getUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

// Storage key
const STORAGE_KEY = 'fishonbase_gamestate_v2';

// Default state
const DEFAULT_STATE: GameState = {
    fishTokens: 0,
    xp: 0,
    level: 1,
    energy: BASE_ENERGY,
    maxEnergy: BASE_ENERGY,
    lastEnergyRefill: Date.now(),
    caughtFishes: [],
    totalCatches: 0,
    upgrades: {},
    lastIncomeCollect: Date.now(),
};

// Custom hook for game state
export function useGameState() {
    const [state, setState] = useState<GameState>(DEFAULT_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const [levelUpAnimation, setLevelUpAnimation] = useState(false);

    // Calculate max energy based on upgrades
    const maxEnergy = useMemo(() => {
        const energyUpgrade = state.upgrades['energyBoost'] || 0;
        return BASE_ENERGY + energyUpgrade * 2;
    }, [state.upgrades]);

    // Calculate hourly income
    const hourlyIncome = useMemo(() => {
        return state.caughtFishes.reduce((total, cf) => total + cf.fish.hourlyIncome, 0);
    }, [state.caughtFishes]);

    // Calculate pending income
    const pendingIncome = useMemo(() => {
        const hoursSinceCollect = (Date.now() - state.lastIncomeCollect) / (1000 * 60 * 60);
        return Math.floor(hourlyIncome * hoursSinceCollect);
    }, [hourlyIncome, state.lastIncomeCollect]);

    // Get upgrade level
    const getUpgradeLevel = useCallback((upgradeId: string) => {
        return state.upgrades[upgradeId] || 0;
    }, [state.upgrades]);

    // Load state from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setState({
                    ...DEFAULT_STATE,
                    ...parsed,
                    level: calculateLevel(parsed.xp || 0),
                });
            }
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (e) {
                console.error('Failed to save game state:', e);
            }
        }
    }, [state, isLoaded]);

    // Energy refill timer
    useEffect(() => {
        if (!isLoaded) return;

        const fastRechargeLevel = state.upgrades['fastRecharge'] || 0;
        const refillTime = ENERGY_REFILL_TIME * (1 - fastRechargeLevel * 0.2);

        const interval = setInterval(() => {
            setState(prev => {
                const currentMaxEnergy = BASE_ENERGY + (prev.upgrades['energyBoost'] || 0) * 2;
                if (prev.energy >= currentMaxEnergy) return prev;

                const timeSinceRefill = Date.now() - prev.lastEnergyRefill;
                const energyToAdd = Math.floor(timeSinceRefill / refillTime);

                if (energyToAdd > 0) {
                    return {
                        ...prev,
                        energy: Math.min(prev.energy + energyToAdd, currentMaxEnergy),
                        lastEnergyRefill: Date.now(),
                    };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoaded, state.upgrades]);

    // Add caught fish
    const addCaughtFish = useCallback((fish: FishType) => {
        setState(prev => {
            const newXp = prev.xp + fish.xp;
            const newLevel = calculateLevel(newXp);

            if (newLevel > prev.level) {
                setLevelUpAnimation(true);
                setTimeout(() => setLevelUpAnimation(false), 2000);
            }

            const caughtFish: CaughtFish = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                fish,
                caughtAt: Date.now(),
            };

            return {
                ...prev,
                fishTokens: prev.fishTokens + fish.fishToken,
                xp: newXp,
                level: newLevel,
                energy: prev.energy - 1,
                caughtFishes: [caughtFish, ...prev.caughtFishes],
                totalCatches: prev.totalCatches + 1,
            };
        });
    }, []);

    // Use energy (returns true if successful)
    const useEnergy = useCallback((): boolean => {
        if (state.energy <= 0) return false;
        return true;
    }, [state.energy]);

    // Collect passive income
    const collectIncome = useCallback(() => {
        if (pendingIncome <= 0) return 0;

        const collected = pendingIncome;
        setState(prev => ({
            ...prev,
            fishTokens: prev.fishTokens + collected,
            lastIncomeCollect: Date.now(),
        }));
        return collected;
    }, [pendingIncome]);

    // Purchase upgrade
    const purchaseUpgrade = useCallback((upgradeId: string): boolean => {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        const currentLevel = state.upgrades[upgradeId] || 0;
        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = getUpgradeCost(upgrade, currentLevel);
        if (state.fishTokens < cost) return false;

        setState(prev => ({
            ...prev,
            fishTokens: prev.fishTokens - cost,
            upgrades: {
                ...prev.upgrades,
                [upgradeId]: (prev.upgrades[upgradeId] || 0) + 1,
            },
        }));

        return true;
    }, [state.fishTokens, state.upgrades]);

    // Reset game
    const resetGame = useCallback(() => {
        setState(DEFAULT_STATE);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Add test tokens (for testing purposes)
    const addTestTokens = useCallback((amount: number) => {
        setState(prev => ({
            ...prev,
            fishTokens: prev.fishTokens + amount,
        }));
    }, []);

    return {
        ...state,
        maxEnergy,
        hourlyIncome,
        pendingIncome,
        isLoaded,
        levelUpAnimation,
        addCaughtFish,
        useEnergy,
        collectIncome,
        purchaseUpgrade,
        getUpgradeLevel,
        resetGame,
        addTestTokens,
        getLevelProgress: () => getLevelProgress(state.xp),
        getRandomFish: () => getRandomFish(state.level, getUpgradeLevel('luckyCharm') * 10),
        getTargetBonus: () => getUpgradeLevel('betterRod') * 15,
    };
}
