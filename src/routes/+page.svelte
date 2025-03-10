<script lang="ts">
  import { goto } from "$app/navigation";
  import { v4 as uuidv4 } from 'uuid';

  const handleSubmit = async (event: Event) => {
      event.preventDefault();
      const id = uuidv4();
      goto(`/${id}/survey`);
  }
</script>

<div class="h-full flex flex-col items-center justify-center space-y-8">
  <h1 class="text-4xl font-bold text-center">Tell Us About Yourself</h1>
  
  <form 
      on:submit={handleSubmit}
      class="w-full max-w-md flex flex-col space-y-6 p-6 bg-slate-800 rounded-xl shadow-lg"
  >
      <div class="space-y-4">
          <label class="block text-sm font-medium">
              About You
              <textarea
                  placeholder="Share your background, skills, and interests..."
                  class="w-full h-32 mt-2 p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
              ></textarea>
          </label>

          <label class="block text-sm font-medium">
              Location
              <input
                  type="text"
                  placeholder="Where are you based?"
                  class="w-full mt-2 p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
          </label>
      </div>

      <button
          type="submit"
          class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
          Continue to Chat
      </button>
  </form>
</div>