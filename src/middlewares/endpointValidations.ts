import logger from '../utils/logger';
import { beautifyError } from '../utils/logger';

import { paramValidator }           from '../utils/paramValidator';
import { EndpointValidatorResult }  from '../custom_typings/endpointValidatorResult';

const validator = (req:any, res:any, next:any, required:any, optional:any, profiler:any, action:string, permitReqWithEmptyBody:boolean = false) :void => {
    try {
        const validatorRes:EndpointValidatorResult  = paramValidator(req.body, required, optional, permitReqWithEmptyBody); 
        
        if (validatorRes.error.length > 0 ) {
            throw validatorRes.error;
        }

        req.profiler = profiler;
        
        next();

    } catch(e) {
        let response = { statusCode: 500, body: { status: "FAILED", error: "GENERAL_ERROR" } };

        if (typeof e === 'string') {
            response.statusCode = 400;
            response.body.error = e;
        }

        res.status(response.statusCode).json(response.body);
        logger.error({ action, error: beautifyError(e) });
        profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
}

export default {

    signUpValidation: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "user-sign-up" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            { name: "string", surname: "string", email: "string", password: "string" }, 
            {}, 
            profiler, 
            "validate-signUpValidation"
        );
    },

    loginValidation: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "user-login" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            { email: "string", password: "string" }, 
            {}, 
            profiler, 
            "validate-loginValidation"
        );
    },

    companyCreate: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "company-create"  });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            { name: "string", description: "string", city: "string", industry: "string" }, 
            {}, 
            profiler, 
            "validate-companyCreate"
        );
    },

    companyUpdate: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "company-update" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            {}, 
            { name: "string", description: "string", city: "string", industry: "string" }, 
            profiler, 
            "validate-companyUpdate"
        );
        
    },

    jobCreate: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "job-create" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            { title: "string", description: "string", city: "string", "remote": 'boolean' }, 
            {}, 
            profiler, 
            "validate-jobCreate"
        );
        
    },

    jobUpdate: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "job-update" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            {}, 
            { title: "string", description: "string", city: "string", remote: 'boolean' }, 
            profiler, 
            "validate-jobCreate"
        );
        
    },

    jobSearch: (req:any, res:any, next:any) :void => {
        logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message: "job-search" });
        const profiler = logger.startTimer();
        validator(
            req, 
            res, 
            next, 
            {},
            { job_keywords: "string", city: "string", remote: 'boolean' }, 
            profiler, 
            "validate-jobCreate",
            true
        );
        
    },

}