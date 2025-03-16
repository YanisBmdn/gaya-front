<script lang="ts">
    const submit = async () => {
        const response = fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
    }

    let password = $state("");
</script>

<div>
    <div class="flex justify-center items-center w-full h-full text-white" transition:fly={{x: -100, duration: 700}}>
        <div class="max-w-[100%] rounded-lg p-2 text-xl shadow-sm text-center">
            <input bind:value={password} type="text" class="w-full rounded-lg border border-slate-600 bg-slate-700 p-4 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
            <button onclick={submit} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Button
            </button>
        </div>
    </div>
</div>