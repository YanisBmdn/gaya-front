<script>
    // Props
    export let isOpen = false;
    export let title = "";
    export let onClose = () => {};
    
    // Handle ESC key to close modal
    function handleKeydown(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    
    // Handle click outside modal content to close
    function handleOutsideClick(event) {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }
    
    // Add keyboard event listener when component mounts
    import { onMount, onDestroy } from 'svelte';
    
    onMount(() => {
      document.addEventListener('keydown', handleKeydown);
    });
    
    onDestroy(() => {
      document.removeEventListener('keydown', handleKeydown);
    });
    
    // Prevent scroll on body when modal is open
    $: if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  </script>
  
  {#if isOpen}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300"
      on:click={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {#if title}
            <h3 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {/if}
          <button 
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            on:click={onClose}
            aria-label="Close modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Modal content -->
        <div class="p-4 text-gray-700 dark:text-gray-300">
          <slot />
        </div>
        
        <!-- Modal footer (optional) -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  {/if}