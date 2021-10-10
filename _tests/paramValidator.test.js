const { paramValidator } = require('../dist/utils/paramValidator');
console.log(typeof paramValidator)
const scenarios = [
    {
        name: "Successful SignUp Validation",
        body: { "email": "hanmont@hmail.com", "password": "12345" },
        required: { email: "string", password: "string" },
        optional: {},
        expected: { success: true, error:"" }
    },
    {
        name: "Failed type SignUp Validation",
        body: { "email": "hanmont@hmail.com", "password": 12345 },
        required: { email: "string", password: "string" },
        optional: {},
        expected: { success: false, error: `VALIDATION_FAILED_PROP_PASSWORD_TYPE` }
    },
    {
        name: "Failed props, unknown property SignUp Validation",
        body: { "mail": "hanmont@hmail.com", "password": "12345" },
        required: { email: "string", password: "string" },
        optional: {},
        expected: { success: false, error: "VALIDATION_FAILED_UNKNOWN_PROPERTY_MAIL" }
    },
    {
        name: "Failed props, missing property SignUp Validation",
        body: {  "password": "12345" },
        required: { email: "string", password: "string" },
        optional: {},
        expected: { success: false, error: "VALIDATION_FAILED_MISSING_REQUIRED_FIELD_EMAIL" }
    },
];

describe.each(scenarios)("Test paramValidator", ({ name, body, required, optional, expected }) => {
    test(name, () => {
        const res = paramValidator(body, required, optional);
        expect(res).toEqual(expected)
    });
});