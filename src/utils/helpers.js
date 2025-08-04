// src/utils/helpers.js
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(relativeTime)
dayjs.locale('fr')

export const formatDate = (date) => {
  return dayjs(date).fromNow()
}

export const formatCookingTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`
}

export const calculateLevel = (xp) => {
  if (xp >= 5000) return 5
  if (xp >= 1500) return 4
  if (xp >= 500) return 3
  if (xp >= 100) return 2
  return 1
}

export const getXpForNextLevel = (currentXp) => {
  const level = calculateLevel(currentXp)
  if (level === 5) return 0 // Max level
  
  const nextLevelXp = Object.values(LEVELS).find(l => l.xp > currentXp)?.xp || 5000
  return nextLevelXp - currentXp
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}