<script lang="ts">
    import { writable, derived } from 'svelte/store';
    import { page } from '$app/state';

    // Configuration
    export let totalBudget = 10000000; // $10 million default
    export let categories = [
        'Infrastructure',
        'Education', 
        'Healthcare', 
        'Environment', 
        'Social Services'
    ];

    // Create a store for allocations
    const allocations = writable(
        categories.map(() => 0)
    );

    // Derived store to calculate total allocated
    const totalAllocated = derived(allocations, $allocs => 
        $allocs.reduce((sum, amount) => sum + amount, 0)
    );

    // Confidence store
    const confidence = writable(3);

    // Explanation store
    const explanation = writable('');

    // Function to update allocations by percentage
    function updateAllocation(index: number, percentage: number) {
        const amount = Math.round(totalBudget * (percentage / 100));
        
        allocations.update(currentAllocations => {
            const newAllocations = [...currentAllocations];
            
            // Calculate total allocation if this change is made
            const otherTotal = currentAllocations.reduce((sum, val, i) => 
                i === index ? sum : sum + val, 0);
            
            // Ensure total doesn't exceed budget
            if (otherTotal + amount <= totalBudget) {
                newAllocations[index] = amount;
            } else {
                // If it would exceed, set to maximum possible
                newAllocations[index] = totalBudget - otherTotal;
            }
            
            return newAllocations;
        });
    }

    $: percentages = $allocations.map(amount => 
        Math.round((amount / totalBudget) * 100)
    );

    // Submit handler
    async function handleSubmit() {
        const submissionData = {
            id: page.params.slug,
            budget: totalBudget,
            budgetDistribution: $allocations.map((amount, index) => ({
                category: categories[index],
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
            body: JSON.stringify(submissionData)
        });
    }

    const confidenceLevels = [
        { value: 1, label: 'Very Low' },
        { value: 2, label: 'Low' },
        { value: 3, label: 'Moderate' },
        { value: 4, label: 'High' },
        { value: 5, label: 'Very High' }
    ];
</script>

<div class="flex h-screen flex-col items-center justify-center gap-8 p-4">
    <h2 class="text-2xl font-bold mb-6">Based on the scenario, how would you allocate the budget ?</h2>
    
    <div class="mb-6">
        <div class="flex justify-between mb-2">
            <span>Total Budget:</span>
            <span>${totalBudget.toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
            <span>Total Allocated:</span>
            <span 
                class={$totalAllocated > totalBudget ? 'text-red-500' : 'text-green-500'}
            >
                ${$totalAllocated.toLocaleString()} 
                ({Math.round(($totalAllocated / totalBudget) * 100)}%)
            </span>
        </div>
    </div>

    <div class="space-y-4 mb-6">
        {#each categories as category, index}
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
                    bind:value={percentages[index]}
                    on:input={(e) => percentages[index] = updateAllocation(index, e.target.value)}
                    class="flex-grow"
                    disabled={$totalAllocated >= totalBudget && $allocations[index] === 0}
                />
                <span class="w-42 text-right">
                    ${$allocations[index].toLocaleString()} 
                    ({percentages[index]}%)
                </span>
            </div>
        {/each}
    </div>

    <div class="mb-6 w-1/4">
        <label class="block mb-2">
            Confidence Level
        </label>
        <div class="flex justify-between">
            {#each confidenceLevels as level}
                <label class="inline-flex items-center">
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

    <div class="mb-6 w-1/3">
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
        class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-1/8"
        disabled={$totalAllocated > totalBudget}
    >
        Submit Budget Allocation
    </button>
</div>
