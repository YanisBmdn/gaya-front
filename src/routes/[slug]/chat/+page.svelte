<script lang="ts">
	import { tick } from 'svelte';
	import Message from '$lib/components/Message.svelte';
	import { plotToBase64 } from '$lib/plotly-helper';
	import { page } from '$app/state';
	import { marked } from 'marked';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { locale } from 'svelte-i18n';
	
	let messages: Array<{ type: 'user' | 'botMessage' | 'botImage'; message: string }> = $state([]);
	let inputValue: string = $state('');
	let chatDiv: HTMLDivElement;
	let isProcessing = $state(false);
	
	const submit = async (e: Event) => {
	  e.preventDefault();
	  if (inputValue.trim() === '') return;
	  if (isProcessing) return;
	  
	  isProcessing = true;
	  
	  try {
		// Add user message
		messages = [...messages, { type: 'user', message: inputValue.trim() }];
		inputValue = '';
		
		// Wait for DOM to update after adding message
		await tick();
		chatDiv.scrollTop = chatDiv.scrollHeight;
		
		// Get visualization
		const response = await fetch(`api/visualization`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept-Language': $locale || 'en'
		},
		body: JSON.stringify({
			chat_id: page.params.slug,
		})
		});
		const json = await response.json();
		
		// Add visualization message
		messages = [...messages, { type: 'botImage', message: json.visualization }];
		
		// Wait for visualization to render in DOM
		await tick();
		await new Promise(resolve => setTimeout(resolve, 500)); // Give extra time for plotly to render
		
		// Find the last plotly element
		const plotDivs = document.querySelectorAll('.js-plotly-plot');
		const lastPlotDiv = plotDivs[plotDivs.length - 1];
		
		if (!lastPlotDiv) {
		  console.error('Plot div not found');
		  messages = [...messages, { 
			type: 'botMessage', 
			message: '' 
		  }];
		  return;
		}
		
		const base64 = await plotToBase64(lastPlotDiv);


		const response2 = await fetch(`api/description`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept-Language': $locale || 'en'
		},
		body: JSON.stringify({
			chat_id: page.params.slug,
			image: base64
		})
		});

		// Get the readable stream
		const reader = response2.body?.getReader();
		const decoder = new TextDecoder();
		let description = '';
		messages = [...messages, { type: 'botMessage', message: '' }];

		// Process the stream
		try {
		while (true) {
			const { done, value } = await reader.read();
			console.log(value);
			if (done) break;
			
			// Decode and append the chunk
			const chunk = decoder.decode(value, { stream: true });
			description += chunk;
			
			// Update the message in real-time
			messages[messages.length - 1].message = await marked.parse(description);
		}
		} catch (error) {
		console.error('Error reading stream:', error);
		}
	  } finally {
		isProcessing = false;
		await tick();
		chatDiv.scrollTop = chatDiv.scrollHeight;
	  }
	};
  </script>
  
  <div class="flex h-screen flex-col items-center justify-end gap-8 bg-slate-900 p-4 text-white">
	<h1 class="text-2xl font-bold">{$_("chat.title")}</h1>
	
	<div bind:this={chatDiv} class="container h-full w-1/2 overflow-auto rounded-lg p-4">
	  {#each messages as { type, message }}
		<Message {type} {message} />
	  {/each}
	</div>
	
	<form onsubmit={submit} class="flex w-1/2">
	  <input
		bind:value={inputValue}
		type="text"
		placeholder={$_("chat.chatPlaceholder")}
		class="rounded-l-lg border border-slate-400 border-r-0 p-2 flex-1"
		disabled={isProcessing}
	  />
	  <button
		type="submit"
		class="rounded-r-lg border border-emerald-500 bg-emerald-500 text-white p-2 cursor-pointer"
		disabled={isProcessing}
	  >
		{isProcessing ? 'Processing...' : 'Chat'}
	  </button>

		<button onclick={() => goto(`/${page.params.slug}/survey?step=post`)} class="rounded-lg bg-blue-500 text-white p-2 cursor-pointer">
			{$_("chat.toSurvey")}
		</button>
	</form>
  </div>