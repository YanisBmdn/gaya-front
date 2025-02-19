<script lang="ts">
    import { tick } from 'svelte';
	import Message from '$lib/components/Message.svelte';

	let messages: Array<{ type: 'user' | 'botMessage' | 'botImage'; message: string }> = $state([]);
	let inputValue: string = $state('');

    let chatDiv: HTMLDivElement;

	const submit = async (e: Event) => {
		e.preventDefault();
		if (inputValue.trim() === '') return;
		messages.push({ type: 'user', message: inputValue.trim() });
		messages.push({ type: 'botImage', message: 'https://via.placeholder.com/150' });
		messages.push({
			type: 'botMessage',
			message:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		});
		inputValue = '';

        await tick();
        chatDiv.scrollTop = chatDiv.scrollHeight;
	};
    
</script>

<div class="flex h-screen flex-col items-center justify-end gap-8 bg-slate-900 p-4 text-white">

	<h1 class="text-2xl font-bold">Climate Science Mentor</h1>
	<div bind:this={chatDiv} class="container h-full w-1/2 overflow-auto rounded-lg p-4">
		{#each messages as { type, message }}
			<Message {type} {message} />
		{/each}
	</div>
    <form onsubmit={submit} class="flex w-1/2">
        <input 
          bind:value={inputValue} 
          type="text" 
          placeholder="Ask any question you want" 
          class="rounded-l-lg border border-slate-400 border-r-0 p-2 flex-1" 
        />
        <button 
          type="submit" 
          class="rounded-r-lg border border-emerald-500 bg-emerald-500 text-white p-2 cursor-pointer"
        >
          Chat
        </button>
      </form>
</div>
