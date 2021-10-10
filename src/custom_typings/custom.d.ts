declare namespace Express {
    export interface Request {
        profiler?: any;
        decoded_token?: any
    }
}

import express = require('express');

declare namespace e {
    export interface MethodOverrideOptions {
        methods: string[];
    }
}

declare function e(getter?: any | ((req: express.Request, res: express.Response) => any), options?: e.MethodOverrideOptions): express.RequestHandler;

export = e;