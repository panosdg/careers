import jwt    from'../utils/jwt';
import logger from'../utils/logger';
import { beautifyError } from '../utils/logger';

export async function verifyToken(req: any, res: any, next: any): Promise<void> {

    logger.profile(req.originalUrl, { level: 'info', url: req.originalUrl, message:"verifyToken" });
    const profiler = logger.startTimer();

    try {
        const bearerHeader = req.headers['authorization'];

        if (bearerHeader) {

            req.token = bearerHeader.split(' ')[1];

            const decoded = await jwt.verify(req.token);

            req.decoded_token = decoded;
            req.profiler = profiler;
            
            next();

        } else {
            throw "USER_NEEDS_AUTHENTICATION";
        }

    } catch(e) {
        logger.error(beautifyError(e));
        res.status(403).json({ status: "FAILED", error: "USER_NEEDS_AUTHENTICATION" });
        profiler.done({ enpoint: req.originalUrl, body: req.body, response: { status: "FAILED", error: "USER_NEEDS_AUTHENTICATION" } });
    }
}