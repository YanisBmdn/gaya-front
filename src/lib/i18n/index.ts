// src/lib/i18n/index.js
import { browser } from '$app/environment';
import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

// Register your translation files
register('en', () => import('./en.json'));
register('jp', () => import('./jp.json'));
// Add other languages as needed

// Initialize with localStorage persistence
export function initI18n() {
  // Get from localStorage or fallback to browser preference or default
  const initialLocale = browser ? localStorage.getItem('locale') || 'en' : 'en';

  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });
  
  // Subscribe to locale changes and save to localStorage
  locale.subscribe((value) => {
    if (value && browser) {
      localStorage.setItem('locale', value);
    }
  });
}