"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useGameState } from "./hooks/useGameState";
import IntroScreen from "./components/IntroScreen";
import FishingGame from "./components/FishingGame";
import Aquarium from "./components/Aquarium";
import Shop from "./components/Shop";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import styles from "./fishing.module.css";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [showIntro, setShowIntro] = useState(true); // Always start with intro
  const [activeTab, setActiveTab] = useState<'fishing' | 'aquarium' | 'shop'>('fishing');

  const gameState = useGameState();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // Test button handler
  const handleAddTestGold = () => {
    gameState.addTestTokens(50);
  };

  if (!gameState.isLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <span className={styles.loadingFish}>🐟</span>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className={styles.container}>
        <IntroScreen onStart={() => setShowIntro(false)} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header
        fishTokens={gameState.fishTokens}
        level={gameState.level}
        energy={gameState.energy}
        maxEnergy={gameState.maxEnergy}
        hourlyIncome={gameState.hourlyIncome}
        xpProgress={gameState.getLevelProgress()}
        levelUpAnimation={gameState.levelUpAnimation}
        onAddTestGold={handleAddTestGold}
      />

      <main className={styles.main}>
        {activeTab === 'fishing' && (
          <FishingGame
            level={gameState.level}
            energy={gameState.energy}
            targetBonus={gameState.getTargetBonus()}
            luckBonus={gameState.getUpgradeLevel('luckyCharm') * 10}
            onCatch={gameState.addCaughtFish}
          />
        )}

        {activeTab === 'aquarium' && (
          <Aquarium
            caughtFishes={gameState.caughtFishes}
            totalCatches={gameState.totalCatches}
            hourlyIncome={gameState.hourlyIncome}
            pendingIncome={gameState.pendingIncome}
            onCollect={gameState.collectIncome}
          />
        )}

        {activeTab === 'shop' && (
          <Shop
            fishTokens={gameState.fishTokens}
            upgrades={gameState.upgrades}
            onPurchase={gameState.purchaseUpgrade}
          />
        )}
      </main>

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
