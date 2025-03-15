<script lang="ts">
  import { goto } from '$app/navigation';
  import { v4 as uuidv4 } from 'uuid';
  import { scenarioInformationStore, chatInformationStore } from '$lib/stores';
  import { _, locale, locales} from 'svelte-i18n';
  import Modal from '$lib/components/Modal.svelte';
	import { onMount } from 'svelte';

  let showModal = $state(false);
  
  onMount(() => {
    openModal();
  });

  function openModal() {
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
  }
  
  let userDescription = $state('');
  let userLocation = $state('');
  let userAgeGroup = $state('');
  let isLoading = $state(false);
  let formError = $state('');
  
  const lang = [{'value': 'en', 'text': 'English'}, {'value':'jp','text':'日本語'}];
  const ageGroups = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'];

  const handleSubmit = async (event: Event) => {
      event.preventDefault();
      
      // Validate form inputs
      if (!userDescription || !userLocation || !userAgeGroup) {
          formError = 'Please fill out all required fields';
          isLoading = false;
          return;
      }
      
      isLoading = true;
      formError = '';

      try {
          // Generate unique chat ID
          const chatId = uuidv4();
          
          // Common headers for API requests
          const headers = {
              'Content-Type': 'application/json',
              'Accept-Language': $locale || 'en'
          };

          // Fetch topic data
          const topicResponse = await fetch('api');
          const topicData = await topicResponse.json();

          // Fetch persona/complexity level
          const personaResponse = await fetch('api/persona', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                  user_description: userDescription,
                  age_group: userAgeGroup
              })
          });
          const complexityLevel = await personaResponse.json();
          
          // Create scenario
          const scenarioResponse = await fetch(`api/scenario`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                  chat_id: chatId,
                  user_description: userDescription,
                  age_group: userAgeGroup,
                  location: userLocation,
                  topic: topicData.topic,
              })
          });

          console.log(topicData.group);
          // Update stores with fetched data
          scenarioInformationStore.set(await scenarioResponse.json());
          chatInformationStore.set({
              chatId,
              userDescription,
              ageGroup: userAgeGroup,
              location: userLocation,
              topicOfInterest: topicData.topic,
              group: topicData.group,
              complexityLevel: complexityLevel,
          });
          
          // Navigate to survey page
          goto(`/${chatId}/survey?step=pre`);
      } catch (error) {
          console.error('Error during form submission:', error);
          formError = 'An error occurred. Please try again.';
          isLoading = false;
      }
  };
</script>

<div class="absolute top-4 right-4">
<select bind:value={$locale}>
  {#each $locales as locale}
    <option value={locale}>{locale}</option>
  {/each}
</select>
</div>

<Modal 
isOpen={showModal} 
title={$_('home.modalTitle')} 
onClose={closeModal}
>
<p class="text-gray-700 dark:text-gray-300">
  {$_('home.modalText')}
</p>

<!-- You can add any other content here -->
<div class="mt-4">
  <p class="italic text-gray-500">{$_('home.modalInformation')}</p>
</div>
</Modal>


<div class="flex h-full flex-col items-center justify-center space-y-8">
<h1 class="text-center text-4xl font-bold">{$_('home.userInfo')}</h1>

<form
  onsubmit={handleSubmit}
  class="flex w-full max-w-md flex-col space-y-6 rounded-xl bg-slate-800 p-6 shadow-lg"
>
  {#if formError}
    <div class="bg-opacity-20 rounded-md bg-red-500 p-3 text-red-200">
      {formError}
    </div>
  {/if}

  <div class="space-y-4">
    <label class="block text-sm font-medium">
      {$_('home.userInfo')}<span class="text-red-400">*</span>
      <textarea
        bind:value={userDescription}
        placeholder={$_('home.userInfoPlaceholder')}
        class="mt-2 h-32 w-full rounded-lg border border-slate-600 bg-slate-700 p-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        rows={4}
        required
      ></textarea>
    </label>

    <label class="block text-sm font-medium">
      {$_('home.location')}<span class="text-red-400">*</span>
      <input
        bind:value={userLocation}
        type="text"
        placeholder={$_('home.locationPlaceholder')}
        class="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700 p-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        required
      />
    </label>

    <label class="block text-sm font-medium">
      {$_('home.ageGroup')}<span class="text-red-400">*</span>
      <select
        bind:value={userAgeGroup}
        class="mt-2 w-full rounded-lg border border-slate-600 bg-slate-700 p-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="" disabled selected>{$_('home.selectAgeGroup')}</option>
        {#each ageGroups as ageGroup}
          <option value={ageGroup}>{ageGroup}</option>
        {/each}
      </select>
    </label>
  </div>

  <button
    type="submit"
    class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 focus:outline-none {isLoading
      ? 'opacity-75'
      : ''}"
    disabled={isLoading}
  >
    {isLoading ? $_('loading') : $_('home.continueToChat')}
  </button>
</form>
</div>