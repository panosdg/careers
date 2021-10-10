import dotenv     from 'dotenv';
import express    from 'express';
import bodyParser from 'body-parser';

dotenv.config();

import logger   from './utils/logger';
import jwt      from './utils/jwt';

import { beautifyError }    from './utils/logger';
import { decrypt, encrypt } from './utils/passwordHandler';
import { verifyToken }      from './middlewares/verifyToken';

import dbOperations         from './data-control/dbOperations';
import endpointValidations  from './middlewares/endpointValidations'



const app = express();
const API_PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

interface ResponseBodyObj {
    status: string,
    error?: string,
    data?: any
    token?: string
}

interface ResponseObj {
    statusCode: number,
    body: ResponseBodyObj
}

app.post('/user/sign-up', endpointValidations.signUpValidation, async (req, res) => {
    let response: ResponseObj = { body: { status: "SUCCESS" }, statusCode: 200 };

    try {

        const rows = await dbOperations.fetchUser(req.body.email);

        if (rows.length) {

            response = { body: { status: "FAILED", error: "USER_ALREADY_EXISTS" }, statusCode: 400 };
        
        } else {
            const insertRes = await dbOperations.insertUserSync(req.body);
            logger.info({ url: req.originalUrl, insertRes });
        }

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/user/login', endpointValidations.loginValidation, async (req, res) => {

    let response:ResponseObj = { body: { status: "SUCCESS", data: {} }, statusCode: 200 };
    logger.profile(req.originalUrl, { level: 'info', endpoint: req.originalUrl, message: "login" });
    const profiler = logger.startTimer();

    try {
        const [ user ] = await dbOperations.fetchUser(req.body.email);
        if (!user) {
            response = { body: { status: "FAILED", error: "USER_DOES_NOT_EXIST" }, statusCode: 404 };
        } else {
            
            if (decrypt(user.password) === req.body.password) {

                response.body.token = jwt.sign({ ...req.body, user_id: user.user_id });
                const companies = await dbOperations.fetchUsersCompanies(user.user_id);
                response.body.data = { user, companies };
                dbOperations.updateUsersLastLogin(req.body.email);

            } else {
                response = { body: { status: "FAILED", error: "WRONG_PASSWORD" }, statusCode: 404 };
            }
        }
    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/company/create', endpointValidations.companyCreate, verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: { } }, statusCode: 200 };

    try {
        const isNewCompany =  await dbOperations.insertNewCompany({
            user_id: req.decoded_token.user_id,
            ...req.body
        });

        if (!isNewCompany){
            response = { body: { status: "FAILED", error: "COMPANY_ALREADY_EXISTS" }, statusCode: 400 };
        }
        const companies = await dbOperations.fetchUsersCompanies(req.decoded_token.user_id);
        response.body.data = { companies };

        

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/company/:company_id/update', endpointValidations.companyUpdate, verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: {} }, statusCode: 200 };

    try {

        const isUpdatedSuccessfuly = await dbOperations.updateCompany(parseInt(req.params.company_id), req.decoded_token.user_id, req.body);

        if (!isUpdatedSuccessfuly){
            response = { body: { status: "FAILED", error: "COMPANY_UPDATE_FAILED" }, statusCode: 400 };
        }

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.delete('/company/:company_id', verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: {} }, statusCode: 200 };

    try {

        const isUpdatedSuccessfuly = await dbOperations.updateCompany(parseInt(req.params.company_id), req.decoded_token.user_id, { active: false });

        if (!isUpdatedSuccessfuly){
            response = { body: { status: "FAILED", error: "COMPANY_UPDATE_FAILED" }, statusCode: 400 };
        }

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/company/:company_id/job/create', endpointValidations.jobCreate, verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: { } }, statusCode: 200 };

    try {
        const isInsertedSuccessfuly =  await dbOperations.insertNewJob({
            company_id: req.params.company_id,
            ...req.body
        });

        if (!isInsertedSuccessfuly){
            response = { body: { status: "FAILED", error: "JOB_CREATION_UNSUCCESSFUL" }, statusCode: 400 };
        }

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/company/:company_id/job/:job_id/update', endpointValidations.jobUpdate, verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: { } }, statusCode: 200 };

    try {
        const isInsertedSuccessfuly =  await dbOperations.updateJob(parseInt(req.params.job_id), parseInt(req.params.company_id), req.decoded_token.user_id, req.body);

        if (!isInsertedSuccessfuly){
            response = { body: { status: "FAILED", error: "JOB_UPDATE_FAILED" }, statusCode: 400 };
        } 

    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.delete('/company/:company_id/job/:job_id', verifyToken, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: {} }, statusCode: 200 };

    try {
        
        const isUpdatedSuccessfuly = await dbOperations.updateJob(parseInt(req.params.job_id), parseInt(req.params.company_id), req.decoded_token.user_id,  { active: false });

        if (!isUpdatedSuccessfuly){
            response = { body: { status: "FAILED", error: "COMPANY_UPDATE_FAILED" }, statusCode: 400 };
        }
    } catch(e) {
        logger.error(beautifyError(e));
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        req.profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.post('/jobs/search', endpointValidations.jobSearch, async(req, res) => {
    let response:ResponseObj = { body: { status: "SUCCESS", data: [] }, statusCode: 200 };
    logger.profile(req.originalUrl, { level: 'info', endpoint: req.originalUrl, message: "job-search" });
    const profiler = logger.startTimer();

    try {
        const jobs = await dbOperations.fetchRelevantJob(req.body);

        if (jobs.length) {
            response.body.data = jobs;
        }
        
    } catch(e) {
        console.error(e);
        response = { body: { status: "FAILED", error: "GENERAL_ERROR" }, statusCode: 500 };
    } finally {
        res.status(response.statusCode).json(response.body);
        profiler.done({ enpoint: req.originalUrl, body: req.body, response });
    }
});

app.listen(API_PORT, () => { logger.info(`API listens at port ${API_PORT}`) });

module.exports = app;