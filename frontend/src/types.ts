export interface Deck {
    uid: string;
    title: string;
    author: string;
}

export interface CardMeta {
    uid: string;
    deckUid: string;
    title: string;
    author: string;
    interval: number;
    repetition: number;
    efactor: number;
    passedAt: Date | undefined;
}

export interface Card {
    uid: string;
    title: string;
    front: string;
    back: string;
}
