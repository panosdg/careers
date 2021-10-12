import crypto from 'crypto';

const algorithm: string = 'aes-256-ctr';
const secretKey: string = process.env.PWD_SECRET_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text:string):string => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${iv.toString('hex')}.${encrypted.toString('hex')}`
};

const decrypt = (content: string):string => {

    const [ iv, pass ] = content.split('.');

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(pass, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

export {
    encrypt,
    decrypt
};