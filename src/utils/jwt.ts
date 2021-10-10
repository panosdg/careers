import jwt from 'jsonwebtoken';

const privateKey = process.env.JWT_TOKEN;

export default {

    sign: (params: any): string =>  { 
            return   jwt.sign(params, privateKey, { expiresIn: '1h' });
    },

    verify: (bearerToken: string): Promise<any> => {
        return new Promise ((resolve, reject) => {
            try {
                jwt.verify(bearerToken, privateKey, function (err: any, decoded:any) {
                    if (err || !decoded) throw err ? err : decoded;
    
                    const now = new Date().getTime() / 1000;
    
                    if (decoded.exp && now < decoded.exp) {
                        resolve(decoded);
                    } else {
                        throw "USER_NEEDS_AUTHENTICATION";
                    }
                });
            } catch(e) {
                reject(e);
            }
        })
    } 
}