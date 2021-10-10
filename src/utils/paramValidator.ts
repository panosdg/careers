// interface response {
//     success: boolean
// }

// interface errResponse extends response {
//     error: string
// }

import { EndpointValidatorResult } from '../custom_typings/endpointValidatorResult';

export function paramValidator (body:any, required: any, optional:any = {}, permitReqWithEmptyBody: boolean = false): EndpointValidatorResult {
    try {
        const keys = Object.keys(body);

        if (!permitReqWithEmptyBody && !keys.length) throw "VALIDATION_FAILED";

        for (let k of keys) {
            const val = required[k] || optional[k];
            
            if (!val ) {
                throw `VALIDATION_FAILED_UNKNOWN_PROPERTY_${k.toUpperCase()}`
            }

            if (typeof body[k] !== val) throw `VALIDATION_FAILED_PROP_${k.toUpperCase()}_TYPE`;

            if (required[k]) delete required[k];

        }

        const [ missingReqProp ] = Object.keys(required);

        if (missingReqProp) throw `VALIDATION_FAILED_MISSING_REQUIRED_FIELD_${missingReqProp.toUpperCase()}`;

        return { success: true, error: "" }

    } catch(error) {
        return { success: false, error };
    }
}