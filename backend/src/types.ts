export type AnkiCardRef = string;

export interface AnkiConfig {
    deckNames: string[],
    decks: Map<string, AnkiCardRef[]>
}
