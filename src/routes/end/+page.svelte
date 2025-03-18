<script lang="ts">
    import { fly } from 'svelte/transition'
    import { _ } from 'svelte-i18n';
</script>

<div class="flex justify-center items-center w-full h-screen h text-white" transition:fly={{x: -100, duration: 700}}>
    <div class="max-w-[100%] rounded-lg p-2 text-xl shadow-sm text-center">
        {@html $_('end').replace(/\n/g, '<br>')}
        <br>
        <div class="pt-4 text-blue-500 underline">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf0GQ2jtPOkDXGMOz-7omZQMIVn08EyrTplivg13_-trfG-Xw/viewform?usp=dialog">{$_('endSurvey')}</a>
    </div>
    </div>
</div>
