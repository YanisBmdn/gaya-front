<script lang="ts">
    import { fly, fade } from 'svelte/transition'
	import { createPlot } from '$lib/plotly-helper';
	import { onMount } from 'svelte';

	export let type: 'user' | 'botMessage' | 'botImage';
	export let message: string;
	export let id: string;

	let plotDiv: HTMLDivElement;

	const loadPlot = async () => {
		const plotData = JSON.parse(message);
		createPlot(plotDiv, plotData);
	}

	onMount(() => {
		if(type === 'botImage' && message) {
			loadPlot();
		}
	})

</script>

{#if type === 'user'}
<div class="flex justify-start w-full text-black" transition:fly={{x: 100, duration: 1500}}>
	<div
		class="max-w-[70%] rounded-lg p-2 bg-slate-300 shadow-md"
	>
		<p class="text-sm font-bold">{type}</p>
		<p class="text-sm">{message}</p>
	</div>
</div>
{:else if type === 'botMessage'}
<div class="flex justify-end w-full text-black" transition:fly={{x: -100, duration: 700}}>
	<div
		class="max-w-[70%] rounded-lg p-2 bg-emerald-300 shadow-md"
	>
		<p class="text-sm font-bold">{type}</p>
		<p class="text-sm">{@html message}</p>
	</div>
</div>
{:else if type === 'botImage'}
<div class="flex justify-center w-full text-black" transition:fly={{x: -100, duration: 700}}>
	<div
		class="max-w-[100%] rounded-lg p-2 shadow-sm"
	>
		<div bind:this={plotDiv} class="plotDiv w-md h-100 rounded-lg bg-transparent" transition:fade={{duration: 1000}}></div>
	</div>
</div>
{/if}