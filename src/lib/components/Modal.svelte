<script>
  import {fade} from 'svelte/transition';
 export let isOpen = false;
 export let title = '';
 export let onClose = () => {};
 function handleEscape(e) {
 if (e.key === 'Escape' && isOpen) {
 onClose();
  }
  }
 $: if (isOpen) {
 document.addEventListener('keydown', handleEscape);
 document.body.classList.add('overflow-hidden');
  } else {
 document.removeEventListener('keydown', handleEscape);
 document.body.classList.remove('overflow-hidden');
  }
 </script>
 {#if isOpen}
 <div
 class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
 tabindex="0"
 transition:fade={{duration: isOpen ? 0 : 400}}
 on:keydown={(e) => e.key === 'Escape' && handleEscape(e)}
 >
 <div
 class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-1/3 w-full max-h-screen overflow-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="modal-title"
 >
 <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
 <h3 id="modal-title" class="text-lg font-medium text-gray-900 dark:text-white">
 {title}
 </h3>
 <button
 type="button"
 class="text-gray-400 hover:text-gray-500 focus:outline-none"
 aria-label="Close"
 on:click={onClose}
 >
 <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div class="p-4">
 <slot />
 </div>
 </div>
 </div>
 {/if}