import { ServiceContext } from "./service-context";

export interface AnkiCardRef {
    repetition: number;
    interval: number;
    efactor: number;
    passedAt: Date | undefined;
}

export interface AnkiConfig {
    deckNames: string[],
    decks: Map<string, Map<string, AnkiCardRef>>
}

export interface ServiceResponse {
    status: number;
    headers: { [key: string]: string };
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

export { ServiceContext };
