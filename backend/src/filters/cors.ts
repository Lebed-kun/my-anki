import { Filter, ServiceContext, ServiceResponse } from "../types";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
};

export class CorsFilter implements Filter {
    public validate(_body: any) {
        return true;
    }

    public async execute(_body: any, _context: ServiceContext): Promise<ServiceResponse> {
        return {
            status: Number(process.env.STATUS_OK!),
            headers: corsHeaders,
            body: ""
        }
    }
}