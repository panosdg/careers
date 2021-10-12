process.env.JWT_TOKEN = "my-secret-private-key";
MockDate = require('mockdate');

const  jwt = require('../dist/utils/jwt');

describe("Sing And Verify Test", () => {
    test("Token Auth Success", async() => {
        MockDate.set(1633962478000)
        const params = { email: "pkat@kmail.com", password: "1123344", user_id: 1 };

        const signRes = jwt.default.sign(params);
        expect(typeof signRes).toBe('string');

        const verRes = await jwt.default.verify(signRes);
        expect(verRes).toEqual({ ...params, iat: 1633962478, exp: 1633966078});

    });

    test("Expired Token", async() => {
        try {
            MockDate.set(1933962478000)
            const params = { email: "pkat@kmail.com", password: "1123344", user_id: 1 };
            const signRes = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBrYXRAa21haWwuY29tIiwicGFzc3dvcmQiOiIxMTIzMzQ0IiwidXNlcl9pZCI6MSwiaWF0IjoxNjMzOTYyNDc4LCJleHAiOjE2MzM5NjYwNzh9.s6_jI2pGQHwP1NiXeaKsl9Zmgwa5hOfrqkTsb5AleVo'
        
            const verRes = await jwt.default.verify(signRes);
            console.log(verRes)
            expect(verRes).toEqual({ ...params, iat: 1633962478, exp: 1633966078 });
        } catch(e) {
            
            expect(e.message).toBe('jwt expired');
        }
        
    })
})
