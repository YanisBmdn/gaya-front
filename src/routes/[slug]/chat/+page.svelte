<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Message from '$lib/components/Message.svelte';
	import { plotToBase64 } from '$lib/plotly-helper';

	import { page } from '$app/state';
	import { marked } from 'marked';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { locale } from 'svelte-i18n';
	import { chatInformationStore, scenarioInformationStore } from '$lib/stores';
	import { messagesToLLMFormat, type MessageType } from '$lib/index';
	import Modal from '$lib/components/Modal.svelte';

	let messages: Array<MessageType> = $state([]);
	let inputValue: string = $state('');
	let chatDiv: HTMLDivElement;
	let isProcessing = $state(false);
	let chatStep = $state(0);

	let showModal = $state(false);

	function openModal() {
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
	}
  

	const visualizationProcess = async () => {
		if (chatStep === 1) {
			await getNewVisualization(
				'Provide a followup visualization for the given scenario and the topic of interest'
			);
		} else {
			await getNewVisualization();
		}
		await tick();

		await new Promise((resolve) => setTimeout(resolve, 500)); // Give extra time for plotly to render
		// Find the last plotly element
		const plotDivs = document.querySelectorAll('.js-plotly-plot');
		const lastPlotDiv = plotDivs[plotDivs.length - 1];

		const base64 = await plotToBase64(lastPlotDiv);

		if (!lastPlotDiv) {
			console.error('Plot div not found');
			messages = [
				...messages,
				{
					type: 'botMessage',
					message: ''
				}
			];
			return;
		}

		await getVisualizationDescription(page.params.slug, base64);
		await tick();
	};

	const getSimpleChat = async (userMessage: string) => {
		try {
			inputValue = '';
			messages = [...messages, { type: 'user', message: userMessage }];

			await tick();
			chatDiv.scrollTop = chatDiv.scrollHeight;

			const response = await fetch(`/api/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept-Language': $locale || 'en'
				},
				body: JSON.stringify({
					messages: messagesToLLMFormat(messages)
				})
			});

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let botResponse = '';
			messages = [...messages, { type: 'botMessage', message: '' }];

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					botResponse += chunk;

					messages[messages.length - 1].message = await marked.parse(botResponse);
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

	const getVisualizationDescription = async (chat_id: string, image: string) => {
		const response = await fetch(`/api/description`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept-Language': $locale || 'en'
			},
			body: JSON.stringify({
				chat_id: chat_id,
				image: image,
				complexity_level: $chatInformationStore.complexityLevel
			})
		});

		// Check if response is ok
		if (!response.ok) {
			console.error(`API Error (Status ${response.status})`);
			return;
		}

		// Add new message to display the incoming stream
		messages = [...messages, { type: 'botMessage', message: '' }];

		// Get reader from the response body stream
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let accumulatedText = '';

		// Process the stream chunk by chunk
		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				// Decode this chunk and add to our accumulated text
				const text = decoder.decode(value, { stream: true });
				accumulatedText += text;

				// Update the message with current text
				messages[messages.length - 1].message = accumulatedText;
			}
		} catch (error) {
			console.error('Error reading stream:', error);
		}
	};

	const getNewVisualization = async (
		message: string = 'Provide a meaningful visualization for the given scenario and the topic of interest'
	) => {
		messages = [...messages, { type: 'botMessage', message: 'Generating new visualization...' }];
		const response = await fetch(`/api/visualization`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept-Language': $locale || 'en'
			},
			body: JSON.stringify({
				chat_id: page.params.slug,
				complexity_level: 0,
				user_description: $chatInformationStore.userDescription,
				location: $chatInformationStore.location,
				messages: messagesToLLMFormat([...messages, { type: 'botMessage', message: message }]),
				scenario: $scenarioInformationStore.scenario,
				topic: $chatInformationStore.topicOfInterest,
				options: $scenarioInformationStore.options
			})
		});

		chatDiv.scrollTop = chatDiv.scrollHeight;
		const json = await response.json();
		messages.pop();
		await tick();

		messages.push({ type: 'botImage', message: json });
		await tick();
	};

	onMount(async () => {
		if ($chatInformationStore.group === 'control') {
			// await visualizationProcess();
		} else if ($chatInformationStore.group === 'proposedMethod') {
			// await visualizationProcess();
		}
	});

	const submit = async (e: Event) => {
		e.preventDefault();
		if (inputValue.trim() === '') return;
		if (isProcessing) return;

		isProcessing = true;

		const userMessage = inputValue.trim();
		getSimpleChat(userMessage);
	};

	const getFollowupVisualization = async () => {
		await visualizationProcess();
	};
</script>

<Modal 
isOpen={showModal} 
title={$_('chat.modalTitle')} 
onClose={closeModal}
>
<p class="text-gray-700 dark:text-gray-300">
  {$_('chat.modalText')}
</p>

<div class="mt-4">
  <p class="italic text-gray-500">{$_('chat.modalInformation')}</p>
</div>

<div class="flex justify-end p-4 border-t dark:border-gray-700">
  <button
    type="button"
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
    onclick={closeModal}
  >
    Cancel
  </button>
  <button
    type="button"
    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    onclick={() => goto(`/${page.params.slug}/survey?step=post`)}
  >
    {$_('chat.toSurvey')}
  </button>
</div>
</Modal>

<div class="flex h-screen flex-col items-center justify-end gap-2 bg-slate-900 p-4 text-white">
	<h1 class="text-2xl font-bold">{$_('chat.title')}</h1>

	<div bind:this={chatDiv} class="container h-full w-1/2 overflow-auto rounded-lg p-4">
		{#each messages as { type, message }}
			<Message {type} {message} />
		{/each}
	</div>
	{#if chatStep === 0 && $chatInformationStore.group === 'Proposed Method'}
		<button
			onclick={async () => {
				chatStep = 1;
				await visualizationProcess();
			}}
			class="cursor-pointer rounded-lg bg-blue-500 p-2 text-white"
			>Get next level visualization</button
		>
	{/if}
	<form onsubmit={submit} class="flex w-1/2">
		<input
			bind:value={inputValue}
			type="text"
			placeholder={$_('chat.chatPlaceholder')}
			class="flex-1 rounded-l-lg border border-r-0 border-slate-400 p-2"
			disabled={isProcessing}
		/>
		<button
			type="submit"
			class="cursor-pointer rounded-r-lg border border-emerald-500 bg-emerald-500 p-2 text-white"
			disabled={isProcessing}
		>
			{isProcessing ? 'Processing...' : 'Chat'}
		</button>

		<button
			onclick={() => openModal()}
			class="cursor-pointer rounded-lg bg-blue-500 p-2 text-white"
		>
			{$_('chat.toSurvey')}
		</button>
	</form>
</div>
