<script lang="ts">
    import { writable, derived } from 'svelte/store';
    import { page } from '$app/state'; // Changed from '$app/state' to '$app/stores'
    import { scenarioInformationStore, chatInformationStore } from '$lib/stores';
	import { goto } from '$app/navigation';
    import { _ } from 'svelte-i18n';
    import { locale } from 'svelte-i18n';

    // Create a store for allocations with proper initialization
    const allocations = writable([]);

    const surveyStep = page.url.searchParams.get('step');
    
    // Initialize the allocations when scenarioInformationStore is loaded
    $: if ($scenarioInformationStore.options && $scenarioInformationStore.options.length > 0) {
        // Only initialize if not already set
        allocations.update(current => {
            if (current.length === 0) {
                return $scenarioInformationStore.options.map(() => 0);
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
        $scenarioInformationStore.budget ? Math.round((amount / $scenarioInformationStore.budget) * 100) : 0
    );

    // Function to update allocation when percentage changes
    function updateAllocationByPercentage(index: number, percentage: number): number {
        if (!$scenarioInformationStore.budget) return;
        
        const amount = Math.round($scenarioInformationStore.budget * (percentage / 100));
        
        allocations.update(currentAllocations => {
            const newAllocations = [...currentAllocations];
            
            // Calculate total allocation if this change is made
            const otherTotal = currentAllocations.reduce((sum, val, i) => 
                i === index ? sum : sum + val, 0);
            
            // Ensure total doesn't exceed budget
            if (otherTotal + amount <= $scenarioInformationStore.budget) {
                newAllocations[index] = amount;
            } else {
                // If it would exceed, set to maximum possible
                newAllocations[index] = $scenarioInformationStore.budget - otherTotal;
            }
            
            return newAllocations;
        });
    }

    // Submit handler
    async function handleSubmit() {
        const submissionData = {
            id: page.params.slug, // Fixed from page.params to $page.params
            budget: $scenarioInformationStore.budget,
            budgetDistribution: $allocations.map((amount, index) => ({
                category: $scenarioInformationStore.options[index],
                amount,
                percentage: percentages[index]
            })),
            totalAllocated: $totalAllocated,
            confidence: $confidence,
            explanation: $explanation,
            group: $chatInformationStore.group,
            topic: $chatInformationStore.topicOfInterest,
            ageGroup: $chatInformationStore.ageGroup,
        };
        
        const response = await fetch(`/api?step=${surveyStep}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': $locale || 'en'
            },
            body: JSON.stringify({...submissionData})
        });

        if (response.ok) {
            surveyStep === "pre" ? goto(`/${page.params.slug}/chat`) : goto('/end')
        } else {
            console.error('Failed to submit budget allocation');
        }
    }

    const confidenceLevels = [
        { value: 1, label:  $_('survey.confidenceLabels.1') },
        { value: 2, label:  $_('survey.confidenceLabels.2') },
        { value: 3, label:  $_('survey.confidenceLabels.3') },
        { value: 4, label:  $_('survey.confidenceLabels.4') },
        { value: 5, label:  $_('survey.confidenceLabels.5') }
    ];
</script>

<div class="flex flex-col items-center justify-center gap-8 p-4 bg-slate-900">
    <p class="w-1/2">{$scenarioInformationStore.scenario || 'Loading scenario...'}</p>
    <h2 class="text-2xl font-bold mb-6">{$_("survey.allocationTitle")}</h2>
    
    <div class="mb-6">
        <div class="flex justify-between mb-2">
            <span>{$_("survey.totalBudget")}</span>
            <span>{$_('currency')}{($scenarioInformationStore.budget || 0).toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
            <span>{$_("survey.totalBudgetAllocated")}</span>
            <span 
                class={$totalAllocated > ($scenarioInformationStore.budget || 0) ? 'text-red-500' : 'text-green-500'}
            >
            {$_('currency')}{$totalAllocated.toLocaleString()} 
                ({$scenarioInformationStore.budget ? Math.round(($totalAllocated / $scenarioInformationStore.budget) * 100) : 0}%)
            </span>
        </div>
    </div>

    <div class="space-y-4 mb-6">
        {#if $scenarioInformationStore.options && $scenarioInformationStore.options.length > 0}
            {#each $scenarioInformationStore.options as category, index}
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
                        on:input={(e) => percentages[index] = updateAllocationByPercentage(index, parseInt(e.target.value))}
                        class="flex-grow"
                        disabled={$totalAllocated >= ($scenarioInformationStore.budget || 0) && $allocations[index] === 0}
                    />
                    <span class="w-42 text-right">
                        ${($allocations[index] || 0).toLocaleString()} 
                        ({percentages[index] || 0}%)
                    </span>
                </div>
            {/each}
        {:else}
            <p>{$_('loading')}</p>
        {/if}
    </div>

    <div class="mb-6 w-full md:w-1/2 lg:w-1/2">
        <label class="block mb-2" for="confidence">
            {$_('survey.confidenceTitle')}
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
            {$_('survey.allocationExplanation')}
        </label>
        <textarea 
            id="explanation"
            bind:value={$explanation}
            rows="4"
            class="w-full border rounded p-2"
            placeholder={$_('survey.allocationExplanationPlaceholder')}
        ></textarea>
    </div>

    <button 
        on:click={handleSubmit}
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={$totalAllocated > ($scenarioInformationStore.budget || 0)}
    >
        {$_('survey.submitSurvey')}
    </button>
</div>