import { writable } from "svelte/store";

export enum Screen {
    Home,
    Card
}

export const screen = writable(Screen.Home);
export const deck = writable("");
