<script lang="ts">
    import { ScreenHeader } from "../common";
    import DeckButton from "./deck-button.svelte";

    async function getDecks() {
        const res = await fetch(
            `${process.env.BACKEND_URL!}/decks`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return await res.json() as string[];
    }

    let decksPromise = getDecks();
</script>

{#await decksPromise}
    <ScreenHeader value="Loading decks..." />
{:then decks} 
    <ScreenHeader value="Choose deck" />

    {#each decks as deck}
        <DeckButton 
            deckName={deck}
            title={deck}
        />
    {/each}
{:catch err}
    <ScreenHeader value="Could not load decks. Details:"/>
    <p>{err.message}</p>
{/await}
