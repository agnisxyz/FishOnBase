'use client';

import React from 'react';
import styles from '../fishing.module.css';

interface NavigationProps {
    activeTab: 'fishing' | 'aquarium' | 'shop';
    onTabChange: (tab: 'fishing' | 'aquarium' | 'shop') => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <nav className={styles.navigation}>
            <button
                className={`${styles.navButton} ${activeTab === 'fishing' ? styles.active : ''}`}
                onClick={() => onTabChange('fishing')}
            >
                <span className={styles.navIcon}>🎣</span>
                <span className={styles.navLabel}>Balık Tut</span>
            </button>
            <button
                className={`${styles.navButton} ${activeTab === 'aquarium' ? styles.active : ''}`}
                onClick={() => onTabChange('aquarium')}
            >
                <span className={styles.navIcon}>🐠</span>
                <span className={styles.navLabel}>Akvaryum</span>
            </button>
            <button
                className={`${styles.navButton} ${activeTab === 'shop' ? styles.active : ''}`}
                onClick={() => onTabChange('shop')}
            >
                <span className={styles.navIcon}>🛒</span>
                <span className={styles.navLabel}>Mağaza</span>
            </button>
        </nav>
    );
}
