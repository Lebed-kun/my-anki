<script lang="ts">
    import { screen, Screen, deck } from "../../store";

    function onClick() {
        $screen = Screen.Home;
        $deck = "";
    }
</script>

<button on:click={onClick}>
    Back
</button>

<!-- TODO: Flash cards -->