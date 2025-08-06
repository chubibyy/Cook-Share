// src/hooks/useXP.js
import { useMemo } from 'react'
import { getLevelFromXP, getProgressToNextLevel } from '../utils/constants'

export const useXP = (xp = 0) => {
  const levelInfo = useMemo(() => {
    const currentLevel = getLevelFromXP(xp)
    const progressInfo = getProgressToNextLevel(xp)
    
    return {
      currentLevel,
      ...progressInfo,
      xp,
      levelNumber: Object.keys(LEVELS).find(key => LEVELS[key] === currentLevel) || 1
    }
  }, [xp])

  // Calculer l'XP nécessaire pour un niveau donné
  const getXPForLevel = (targetLevel) => {
    return LEVELS[targetLevel]?.xp || 0
  }

  // Vérifier si un niveau est débloqué
  const isLevelUnlocked = (targetLevel) => {
    return xp >= getXPForLevel(targetLevel)
  }

  // Calculer l'XP gagné récemment (animation)
  const calculateXPGain = (oldXP, newXP) => {
    return Math.max(0, newXP - oldXP)
  }

  return {
    ...levelInfo,
    getXPForLevel,
    isLevelUnlocked,
    calculateXPGain
  }
}

