<script lang="ts">
    import { fly, fade } from 'svelte/transition'
	import { createPlot } from '$lib/plotly-helper';
	import { onMount } from 'svelte';

	export let type: 'user' | 'botMessage' | 'botImage';
	export let message: string;

	let plotDiv: HTMLDivElement;

	const loadPlot = async () => {
		const plotData = JSON.parse(message);
		createPlot(plotDiv, plotData);
	}

	onMount(() => {
		console.log("is mounted");
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
		<p class="text-sm font-bold pb-2">{type}</p>
		
		<p class="text-sm">{message}</p>
	</div>
</div>
{:else if type === 'botMessage'}
<div class="flex justify-end w-full text-black" transition:fly={{x: -100, duration: 700}}>
	<div
		class="max-w-[70%] rounded-lg p-2 bg-emerald-300 shadow-md"
	>
		<p class="text-sm font-bold pb-2">assistant</p>
		<p class="text-sm text-justify mardown-content">{@html message}</p>
	</div>
</div>
{:else if type === 'botImage'}
<div class="flex justify-center w-full text-black" transition:fly={{x: -100, duration: 700}}>
	<div
		class="max-w-[100%] rounded-lg p-2 shadow-sm"
	>
		<div bind:this={plotDiv} class="plotDiv w-1/8 h-100 rounded-lg bg-transparent" transition:fade={{duration: 1000}}></div>
	</div>
</div>
{/if}
<style>
	/* Markdown styles - using :global to target injected HTML */
	:global(.markdown-content h1) {
	  font-size: 1.25rem;
	  font-weight: bold;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content h2) {
	  font-size: 1.125rem;
	  font-weight: bold;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content h3) {
	  font-size: 1rem;
	  font-weight: bold;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content p) {
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content ul) {
	  list-style-type: disc;
	  padding-left: 1.25rem;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content ol) {
	  list-style-type: decimal;
	  padding-left: 1.25rem;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content li) {
	  margin-bottom: 0.25rem;
	}
	
	:global(.markdown-content pre) {
	  background-color: #f3f4f6;
	  padding: 0.5rem;
	  border-radius: 0.25rem;
	  margin-bottom: 0.5rem;
	  overflow-x: auto;
	}
	
	:global(.markdown-content code) {
	  background-color: #f3f4f6;
	  padding: 0.125rem 0.25rem;
	  border-radius: 0.25rem;
	  font-family: monospace;
	  font-size: 0.875rem;
	}
	
	:global(.markdown-content blockquote) {
	  border-left: 4px solid #d1d5db;
	  padding-left: 1rem;
	  font-style: italic;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content a) {
	  color: #2563eb;
	  text-decoration: underline;
	}
	
	:global(.markdown-content table) {
	  width: 100%;
	  border-collapse: collapse;
	  margin-bottom: 0.5rem;
	}
	
	:global(.markdown-content th, .markdown-content td) {
	  border: 1px solid #d1d5db;
	  padding: 0.25rem 0.5rem;
	  text-align: left;
	}
	
	:global(.markdown-content th) {
	  background-color: #f3f4f6;
	  font-weight: bold;
	}
	
	:global(.markdown-content hr) {
	  border: 0;
	  border-top: 1px solid #d1d5db;
	  margin: 0.5rem 0;
	}
	
	:global(.markdown-content img) {
	  max-width: 100%;
	  height: auto;
	  border-radius: 0.25rem;
	}
  </style>