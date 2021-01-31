<script lang="ts">
    import { screen, Screen, deck } from "../../store";

    export let deckName: string;
    export let title: string;

    function onClick() {
        $screen = Screen.Card;
        $deck = deckName;
    }
</script>

<button on:click={onClick}>
    {title}
</button>
