import { Db } from "mongodb";

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

interface Dict {
    [k: string]: string | string[] | undefined;
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

export interface BasicState {
    [k: string]: any;
}

export interface HookContext<T extends BasicState> {
    request: Request;
    response: Response;
    state: T;
}

export type HookHandler<T extends BasicState> = (ctx: HookContext<T>) => Promise<any>;

export interface State {
    db: Db;
    resourcesPath: string;
    fallbackPage: string;
}

export enum PasswordConcatMethod {
    Append = "append",
    Merge = "merge",
}

export interface PasswordConfig {
    hash: string;
    salt: string;
    concatMethod: PasswordConcatMethod;
    reversePassword: boolean;
}

export interface User {
    nickname: string;
    email: string;
    passwordConfig: PasswordConfig;
    confirmationCode: string;
    confirmed: boolean;
}
