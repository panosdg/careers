require('dotenv').config({ path: '../.env' });

const MockDate          = require('mockdate');
const request           = require('supertest');

const app = require('../dist');

const pgClient = require('../dist/controllers/postgres')


beforeAll(async() => {
    await pgClient.default.query("DELETE FROM users WHERE email= 'mick@hmail.com'");
})

const scenarios = [
    {
        name: "Sign UP An existing User",
        body: {
            "name": "Jean",
            "surname": "Jeannie",
            "email": "jjeanie@hmail.com",
            "password": "12345"
        },
        endpoint: '/user/sign-up',
        expecting_res: {
            statusCode: 400,
            body: { status: 'FAILED', error: 'USER_ALREADY_EXISTS' }
        }
    },

    {
        name: "Sign UP A new User",
        body: {
            "name": "Mick",
            "surname": "Jagger",
            "email": "mick@hmail.com",
            "password": "12345"
        },
        endpoint: '/user/sign-up',
        expecting_res: {
            statusCode: 200,
            body: { status: 'SUCCESS' }
        }
    },

    {
        name: "Login Failure",
        body: {
            "email": "jjeanie@hmail.com",
            "password": "1234"
        },
        endpoint: '/user/login',
        expecting_res: {
            statusCode: 404,
            body: { status: 'FAILED', error: 'WRONG_PASSWORD' }
        },

    },

    {
        name: "Login Success",
        body: {
            "email": "jjeanie@hmail.com",
            "password": "12345"
        },
        endpoint: '/user/login',
        expecting_res: {
            statusCode: 200,
            body: { status: 'SUCCESS' }
        }
    },
]

describe.each(scenarios)("Test API", ({ name, body, endpoint, expecting_res }) => {

    
    test(name, async() => {

        const res = await request(app).post(endpoint).send(body);
  
        expect(res.statusCode).toBe(expecting_res.statusCode);
        expect(res.body.status).toBe(expecting_res.body.status);
        expect(res.body.error).toBe(expecting_res.body.error);
        
    });

})
