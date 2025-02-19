<script lang="ts">
    import { goto } from "$app/navigation"

    const submit = async (e: Event) => {
        e.preventDefault();
        goto("/chat");
    }
</script>
<div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-4xl font-bold">Information about you</h1>
  <form onsubmit={submit} class="flex flex-col items-center justify-center gap-2">
    <input type="text" placeholder="information about you" class="border border-gray-300 p-2 rounded-lg mt-4" />
    <input type="text" placeholder="your localization" class="border border-gray-300 p-2 rounded-lg mt-4" />
    <button type="submit" class="bg-blue-500 text-white rounded p-2">
        Submit
    </button>
  </form>
</div>