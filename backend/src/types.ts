export type AnkiCardRef = string;

export interface AnkiConfig {
    deckNames: string[],
    decks: Map<string, AnkiCardRef[]>
}

export interface ServiceContext {
    resourcesPath: string;
    memConfig: AnkiConfig;
    fallbackPage: string;
}

export interface ServiceResponse {
    contentType: string;
    body: string;
}
