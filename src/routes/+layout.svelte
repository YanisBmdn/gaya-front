<script lang="ts">
	import '../app.css';
	import '../reset.css';
	let { children } = $props();
</script>

<div class="w-full h-screen md:max-h-screen bg-slate-900 text-white flex flex-col justify-between">
	{@render children()}
	<p class="text-center text-gray-500 text-sm bg-slate-900">
		All information provided is for research purpose only. We do not store nor disclose any personal information.
	</p>
</div>