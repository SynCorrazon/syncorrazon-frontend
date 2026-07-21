// src/utils/watchTime.js

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This utility tracks how long a user has watched in a day.
  2. The free tier limit is 1.5 hours (90 minutes) per day.
  3. It uses localStorage to persist watch time across page refreshes.
  4. It resets daily (based on the user's local time).
  5. I use it to check if a user has exceeded their free tier limit.
*/

const MAX_WATCH_TIME_MINUTES = 90; // 1.5 hours
const STORAGE_KEY = 'syncorrazon_watch_time';

// Get today's date as a string (YYYY-MM-DD)
const getToday = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Get the current watch time data from localStorage
const getWatchData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { date: getToday(), minutes: 0 };
    }
    const data = JSON.parse(stored);
    // If the stored date is not today, reset the minutes
    if (data.date !== getToday()) {
      return { date: getToday(), minutes: 0 };
    }
    return data;
  } catch (error) {
    console.error('Error reading watch time:', error);
    return { date: getToday(), minutes: 0 };
  }
};

// Save watch time data to localStorage
const saveWatchData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving watch time:', error);
  }
};

// Add minutes to the current watch time
export const addWatchTime = (minutes) => {
  const data = getWatchData();
  const newMinutes = Math.min(data.minutes + minutes, MAX_WATCH_TIME_MINUTES);
  saveWatchData({ ...data, minutes: newMinutes });
  return newMinutes;
};

// Get the current watch time in minutes
export const getWatchTime = () => {
  const data = getWatchData();
  return data.minutes;
};

// Check if the user has exceeded the free tier limit
export const hasExceededFreeTier = () => {
  const data = getWatchData();
  return data.minutes >= MAX_WATCH_TIME_MINUTES;
};

// Get the remaining watch time in minutes
export const getRemainingWatchTime = () => {
  const data = getWatchData();
  return Math.max(0, MAX_WATCH_TIME_MINUTES - data.minutes);
};

// Get the remaining watch time as a formatted string
export const getRemainingWatchTimeFormatted = () => {
  const remaining = getRemainingWatchTime();
  const hours = Math.floor(remaining / 60);
  const minutes = Math.floor(remaining % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Reset watch time for today (useful for testing)
export const resetWatchTime = () => {
  saveWatchData({ date: getToday(), minutes: 0 });
};

// Check if watch time is about to expire (less than 5 minutes remaining)
export const isWatchTimeLow = () => {
  const remaining = getRemainingWatchTime();
  return remaining > 0 && remaining <= 5;
};

export default {
  addWatchTime,
  getWatchTime,
  hasExceededFreeTier,
  getRemainingWatchTime,
  getRemainingWatchTimeFormatted,
  resetWatchTime,
  isWatchTimeLow,
  MAX_WATCH_TIME_MINUTES,
};