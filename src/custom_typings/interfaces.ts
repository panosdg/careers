export interface ResponseBodyObj {
    status: string,
    error?: string,
    data?: any
    token?: string
}

export interface ResponseObj {
    statusCode: number,
    body: ResponseBodyObj
}

export interface InsertUserParams {
    name: string,
    surname: string,
    email: string,
    password: string
}

export interface InsertCompanyParams {
    user_id: number,
    name: string,
    description: string,
    city: string,
    industry: string
}

export interface UpdateCompanyParams {
    name?: string,
    description?: string,
    city?: string,
    industry?: string
}

export interface SearchJobParams { job_keywords?: string, remote?: boolean, city?: string }

export interface InsertJobParams {
    company_id: number,
    title: string,
    description: string,
    city: string,
    remote: boolean
}

export interface JobRow {
    job_id: number,
    company_id: number,
    active: boolean,
    title: string,
    description: string,
    city: string,
    remote: boolean,
    created_on: Date,
    last_modified: Date
}