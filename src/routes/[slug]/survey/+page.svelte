<script lang="ts">
    import { writable, derived } from 'svelte/store';
    import { page } from '$app/state'; // Changed from '$app/state' to '$app/stores'
    import { userDescriptionStore } from '$lib/stores';
	import { goto } from '$app/navigation';

    // Create a store for allocations with proper initialization
    const allocations = writable([]);

    const surveyStep = page.url.searchParams.get('step');
    
    // Initialize the allocations when userDescriptionStore is loaded
    $: if ($userDescriptionStore.options && $userDescriptionStore.options.length > 0) {
        // Only initialize if not already set
        allocations.update(current => {
            if (current.length === 0) {
                return $userDescriptionStore.options.map(() => 0);
            }
            return current;
        });
    }

    // Derived store to calculate total allocated
    const totalAllocated = derived(allocations, $allocs => 
        $allocs.reduce((sum, amount) => sum + amount, 0)
    );

    // Confidence store
    const confidence = writable(3);

    // Explanation store
    const explanation = writable('');

    // Calculate percentages from allocations
    $: percentages = $allocations.map(amount => 
        $userDescriptionStore.budget ? Math.round((amount / $userDescriptionStore.budget) * 100) : 0
    );

    // Function to update allocation when percentage changes
    function updateAllocationByPercentage(index: number, percentage: number) {
        if (!$userDescriptionStore.budget) return;
        
        const amount = Math.round($userDescriptionStore.budget * (percentage / 100));
        
        allocations.update(currentAllocations => {
            const newAllocations = [...currentAllocations];
            
            // Calculate total allocation if this change is made
            const otherTotal = currentAllocations.reduce((sum, val, i) => 
                i === index ? sum : sum + val, 0);
            
            // Ensure total doesn't exceed budget
            if (otherTotal + amount <= $userDescriptionStore.budget) {
                newAllocations[index] = amount;
            } else {
                // If it would exceed, set to maximum possible
                newAllocations[index] = $userDescriptionStore.budget - otherTotal;
            }
            
            return newAllocations;
        });
    }

    // Submit handler
    async function handleSubmit() {
        const submissionData = {
            id: page.params.slug, // Fixed from page.params to $page.params
            budget: $userDescriptionStore.budget,
            budgetDistribution: $allocations.map((amount, index) => ({
                category: $userDescriptionStore.options[index],
                amount,
                percentage: percentages[index]
            })),
            totalAllocated: $totalAllocated,
            confidence: $confidence,
            explanation: $explanation
        };
        
        const response = await fetch('/api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({submissionData, step: surveyStep})
        });

        // Handle response (add success/error handling)
        if (response.ok) {
            // Show success message or redirect
            surveyStep === "pre" ? goto(`/${page.params.slug}/chat`) : goto('/end')
        } else {
            // Show error message
            console.error('Failed to submit budget allocation');
        }
    }

    const confidenceLevels = [
        { value: 1, label: 'Very Low' },
        { value: 2, label: 'Low' },
        { value: 3, label: 'Moderate' },
        { value: 4, label: 'High' },
        { value: 5, label: 'Very High' }
    ];
</script>

<div class="flex flex-col items-center justify-center gap-8 p-4 bg-slate-900">
    <p class="w-1/2">{$userDescriptionStore.scenario || 'Loading scenario...'}</p>
    <h2 class="text-2xl font-bold mb-6">{surveyStep === "pre" ? "Based on the scenario, how would you allocate the budget?" : "Based on the scenario and the chat you had with the agent. How would you allocate the budget?"}</h2>
    
    <div class="mb-6">
        <div class="flex justify-between mb-2">
            <span>Total Budget:</span>
            <span>${($userDescriptionStore.budget || 0).toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
            <span>Total Allocated:</span>
            <span 
                class={$totalAllocated > ($userDescriptionStore.budget || 0) ? 'text-red-500' : 'text-green-500'}
            >
                ${$totalAllocated.toLocaleString()} 
                ({$userDescriptionStore.budget ? Math.round(($totalAllocated / $userDescriptionStore.budget) * 100) : 0}%)
            </span>
        </div>
    </div>

    <div class="space-y-4 mb-6">
        {#if $userDescriptionStore.options && $userDescriptionStore.options.length > 0}
            {#each $userDescriptionStore.options as category, index}
                <div class="flex items-center space-x-4">
                    <label class="w-1/3" for={`slider-${index}`}>
                        {category}
                    </label>
                    <input 
                        id={`slider-${index}`}
                        type="range" 
                        min="0" 
                        max="100"
                        step="2"
                        value={percentages[index]}
                        on:input={(e) => updateAllocationByPercentage(index, parseInt(e.target.value))}
                        class="flex-grow"
                        disabled={$totalAllocated >= ($userDescriptionStore.budget || 0) && $allocations[index] === 0}
                    />
                    <span class="w-42 text-right">
                        ${($allocations[index] || 0).toLocaleString()} 
                        ({percentages[index] || 0}%)
                    </span>
                </div>
            {/each}
        {:else}
            <p>Loading options...</p>
        {/if}
    </div>

    <div class="mb-6 w-full md:w-1/2 lg:w-1/4">
        <label class="block mb-2">
            Confidence Level
        </label>
        <div class="flex justify-between flex-wrap">
            {#each confidenceLevels as level}
                <label class="inline-flex items-center mb-2">
                    <input
                        type="radio"
                        name="confidence"
                        value={level.value}
                        bind:group={$confidence}
                        class="form-radio"
                    />
                    <span class="ml-2">{level.label}</span>
                </label>
            {/each}
        </div>
    </div>

    <div class="mb-6 w-full md:w-1/2 lg:w-1/3">
        <label class="block mb-2" for="explanation">
            Explanation of Allocation
        </label>
        <textarea 
            id="explanation"
            bind:value={$explanation}
            rows="4"
            class="w-full border rounded p-2"
            placeholder="Explain the reasoning behind your budget allocation..."
        ></textarea>
    </div>

    <button 
        on:click={handleSubmit}
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={$totalAllocated > ($userDescriptionStore.budget || 0)}
    >
        Submit Budget Allocation
    </button>
</div>