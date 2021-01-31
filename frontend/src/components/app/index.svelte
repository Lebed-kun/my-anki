<script lang="ts">
    import ChooseDeck from "../choose-deck";
    import RandomCard from "../random-card";
    import { screen, Screen } from "../../store";
</script>

{#if $screen === Screen.Card}
    <RandomCard />
{:else}
    <ChooseDeck />
{/if}

