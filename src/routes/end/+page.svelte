<script lang="ts">
    import { fly } from 'svelte/transition'
    import { _ } from 'svelte-i18n';
</script>

<div class="flex justify-center items-center w-full h-full text-white" transition:fly={{x: -100, duration: 700}}>
    <div class="max-w-[100%] rounded-lg p-2 text-xl shadow-sm text-center">
        {@html $_('end').replace(/\n/g, '<br>')}
    </div>
</div>
