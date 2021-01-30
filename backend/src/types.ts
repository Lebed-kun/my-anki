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
    status: number;
    contentType: string;
    body: string;
}

export interface Filter {
    validate(body: any): boolean;
    execute(body: any, context: ServiceContext): Promise<ServiceResponse>;
}

export type Routes = Map<
    string,
    Map<string, Filter>
>;
