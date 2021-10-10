process.env.PWD_SECRET_KEY='vOVH4sdmpNWjZRIqCc7rdxs01lwHzfr3';
const passHandler = require('../dist/utils/passwordHandler');


test("is the same", () => {
    const enc = passHandler.encrypt('123456');
    console.log(enc);
    var dec = passHandler.decrypt(enc);
    console.log(dec);
    expect(dec).toBe('123456')
})