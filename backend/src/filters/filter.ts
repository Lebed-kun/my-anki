import { ServiceContext, ServiceResponse } from "../types";

export interface Filter {
    validate(method: string, action: string, body: any): boolean;
    execute(body: any, context: ServiceContext): Promise<ServiceResponse>;
}
