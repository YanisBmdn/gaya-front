<script lang="ts">
	import '../app.css';
	import '../reset.css';
	import '$lib/i18n';
	import { initI18n } from '$lib/i18n';

	import { _, waitLocale } from 'svelte-i18n';
  
	initI18n();

	const localeLoaded = waitLocale();


	let { children } = $props();
</script>


<div class="w-full h-screen md:max-h-screen bg-slate-900 text-white flex flex-col justify-between">
	{#await localeLoaded}
		<p class="text-center text-gray-500 text-sm bg-slate-900">
			Loading...
		</p>
	{:then}
	{@render children()}
	<p class="text-center text-gray-500 text-sm bg-slate-900">
		{$_('footer')}
	</p>
	{/await}
</div>