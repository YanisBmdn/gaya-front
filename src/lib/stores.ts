import type { ScenarioResponse } from '$lib/server'
import { writable, type Writable } from 'svelte/store'
import { browser } from '$app/environment';

const createPersistentStore = (key: string, initialValue: any) => {
    // Only access localStorage in the browser
    let savedData;
    if (browser) {
      savedData = localStorage.getItem(key);
    }
  
    // Initialize the store with saved data or the initial value
    const initialData = savedData ? JSON.parse(savedData) : initialValue;
    const store = writable(initialData);
  
    // Subscribe to the store and save changes to localStorage (client-side only)
    if (browser) {
      store.subscribe((value) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    }
  
    return store;
  }

export const scenarioInformationStore: Writable<ScenarioResponse> = createPersistentStore('userDescription', {})

interface ChatInformation {
    chatId: string;
    userDescription: string;
    ageGroup: string;
    location: string;
    topicOfInterest: string;
    complexityLevel: number;
    group: 'control' | 'proposedMethod';
}

export const chatInformationStore: Writable<ChatInformation> = createPersistentStore('chatInformation', {})
