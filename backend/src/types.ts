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

interface Dict {
    [k: string]: string;
}

export interface Request {
    method: string;
    url: string;
    params: Dict;
    query: Dict;
    headers: Dict;
    body: any;
}

export interface Response {
    status: number;
    headers: Dict;
    body: any;
}

export interface HookContext<T> {
    request: Request;
    response: Response;
    state: T;
}

export type HookHandler<T> = (ctx: HookContext<T>) => Promise<any>;

export { ServiceContext };
