import { Client } from 'pg';
const connectionString = "postgres://mhytlasn:WExa6Rn6QoXN5_fzByoYBK9A-VTbm7bj@surus.db.elephantsql.com/mhytlasn"//process.env.DB_CONN;
const pgClient = new Client({ connectionString,})
pgClient.connect();
//import pgClient from '../controllers/postgres';
import logger from '../utils/logger';
import { beautifyError } from '../utils/logger';
import { encrypt, decrypt } from '../utils/passwordHandler';

const formatDate = (date = new Date()) => date.toISOString().replace('T'," ").replace("Z", "");

const executeQuerySync = (query: string) : Promise<any> => new Promise((resolve, reject) => {
    logger.profile("executeQuerySync", { level: 'info', query, message: "executing query in postgres"  });
    const profiler = logger.startTimer();
    try {
        pgClient.query(query, (error:any, query_result:any) => {

            profiler.done({ query_result, error });

            if (error) throw error;

            resolve(query_result);
        });
    } catch(e) {
        logger.error(beautifyError(e));
        reject(e);
    }
})
interface InsertUserParams {
    name: string,
    surname: string,
    email: string,
    password: string
}

interface InsertCompanyParams { 
    user_id: number, 
    name: string, 
    description: string, 
    city: string, 
    industry: string 
}

interface UpdateCompanyParams {
    name?: string, 
    description?: string, 
    city?: string, 
    industry?: string 
}

interface SearchJobParams { job_keywords?: string, remote?:boolean, city?: string }

interface InsertJobParams { 
    company_id: number, 
    title: string, 
    description: string, 
    city: string, 
    remote: boolean 
}

interface JobRow {
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

export default {
    insertUserSync: async(userParams: InsertUserParams): Promise<any> => {
        const {name , surname, email, password} = userParams;

        const query = `INSERT INTO users(name, surname, email, password, created_on, last_login )
        VALUES ('${name}', '${surname}', '${email}', '${encrypt(password)}', '${formatDate()}', ${null});`
        
        try {
            return await executeQuerySync(query);
        } catch(e) {
            throw e;
        }
    }, 

    insertNewCompany: async(companyParams: InsertCompanyParams): Promise<boolean> => {
        const { user_id, name, description, city, industry, } = companyParams;

        const query = `INSERT INTO companies(user_id, active, name, description, city, industry, created_on )
        SELECT ${user_id}, true, '${name}', '${description}', '${city}', '${industry}', '${formatDate()}'
        WHERE NOT EXISTS (SELECT 1 FROM companies WHERE user_id=${user_id} AND name='${name}');`;
        
        try {
            const { rowCount } = await executeQuerySync(query);
            return Boolean(rowCount);
        } catch(e) {
            throw e;
        }
    },

    insertNewJob: async(jobParams: InsertJobParams): Promise<boolean> => {
        const { company_id, title, description, city, remote } = jobParams

        const query = `INSERT INTO jobs (company_id, active, title, description, city, remote, created_on)
        VALUES(${company_id}, true, '${title}', '${description}', '${city}', ${remote}, '${formatDate()}');`;
        
        try {
            const { rowCount } = await executeQuerySync(query);
            return Boolean(rowCount);
        } catch(e) {
            throw e;
        }
    },

    fetchUser: async (email: string): Promise<any> => {
        try {
            const query = `SELECT * FROM users WHERE email='${email}'`;
            
            const { rows } = await executeQuerySync(query);
            return rows;
        } catch(e) {
            throw e;
        }
    },

    fetchUsersCompanies: async (user_id: number): Promise<any> => {
        try {
            const query = `SELECT * FROM companies WHERE user_id='${user_id}'`;
            
            const { rows } = await executeQuerySync(query);
            return rows;
        } catch(e) {
            throw e;
        }
    },

    updateUsersLastLogin: (email: string): void =>  {
        try {
            const query = `UPDATE users  SET last_login = '${formatDate()}' WHERE email = '${email}';`;
            logger.profile("updateUsersLastLogin", { level: 'info', query, message: "executing query in postgres" });
            const profiler = logger.startTimer();
            
            pgClient.query(query, (error:any, query_result:any) => {
                profiler.done({ query_result, error });

                if (error) throw(error);
            });
        } catch(e) {
            logger.error(beautifyError(e));
        }
    },

    updateCompany: async(company_id: number, user_id: number, params: UpdateCompanyParams | any): Promise<boolean> => {
        try {
            let queryParamsToUpdate = " ";

            const keys = Object.keys(params);

            for(let i = 0; i < keys.length; i++) {
                queryParamsToUpdate += `${keys[i]}= `;
                queryParamsToUpdate += (typeof params[keys[i]] === 'boolean' || typeof params[keys[i]] === 'number' ) ? `${params[keys[i]]}` : `'${params[keys[i]]}'`;

                if (i + 1 < keys.length ) {
                    queryParamsToUpdate += ", "
                }
            }

            const query = `UPDATE companies  SET last_modified = '${formatDate()}', ${queryParamsToUpdate} WHERE company_id= '${company_id}' AND user_id= ${user_id};`;

            const { rowCount } = await executeQuerySync(query);
            return Boolean(rowCount);
        } catch(e) {
            logger.error(beautifyError(e));
            throw e;
        }
    },

    updateJob: async(job_id: number, company_id: number, user_id: number, params: any): Promise<boolean> => {
        try {
            let queryParamsToUpdate = " ";

            const keys = Object.keys(params);

            for(let i = 0; i < keys.length; i++) {
                queryParamsToUpdate += `${keys[i]}= `;
                queryParamsToUpdate += (typeof params[keys[i]] === 'boolean' || typeof params[keys[i]] === 'number' ) ? `${params[keys[i]]}` : `'${params[keys[i]]}'`;

                if (i + 1 < keys.length ) {
                    queryParamsToUpdate += ", "
                }
            }

            const query = `UPDATE jobs
            SET last_modified = '${formatDate()}', ${queryParamsToUpdate}
            WHERE
            job_id= (
            select job_id 
            FROM jobs 
            LEFT JOIN companies on jobs.company_id = companies.company_id
            WHERE job_id='${job_id}' AND companies.user_id= '${user_id}' AND companies.company_id= '${company_id}')`;

            const res = await executeQuerySync(query);
            return Boolean(res.rowCount);
        } catch(e) {
            logger.error(beautifyError(e));
            throw e;
        }
    },

    _fetchRelevantJob: (searchJobParams: SearchJobParams): Promise<any> => new Promise((resolve, reject) => {
        try{
            let { job_keywords, remote, city } = searchJobParams;

            let baseQuery = `SELECT * 
            FROM jobs
            WHERE 
            active= true `;

            if (typeof remote === 'boolean') baseQuery += ' AND remote= ' + remote;
            if (city) baseQuery += ` AND city= '${city}' `;

            let query = baseQuery; 

            if (job_keywords) {

                job_keywords = job_keywords.trim(); 

                query += ` AND title ~* '${job_keywords}'`;

                const kwdsArr = job_keywords.split(' ').sort((a, b) => b.length - a.length);

                let descriptionQuery = '';

                if (kwdsArr.length > 1) {
                    query = `(${query})`;
                    
                    for (let kwd of kwdsArr) {
                        query += ` UNION (${baseQuery} AND title ~* '${kwd}') `;
                        descriptionQuery += ` UNION (${baseQuery} AND description ~* '${kwd}') `;
                    }
                }

                query += ` UNION (${baseQuery} AND description ~* '${job_keywords}') `;

                if (descriptionQuery) query += ` ${descriptionQuery}`;
            }

            pgClient.query(query, (err:any, res:any) => {
                if (err) throw(err);
                console.log('fetchRelevantJob: ', res.rows);
                resolve(res.rows);
            });

            
        } catch(e) {
            reject(e);
        }
    }),

    fetchRelevantJob: async(searchJobParams: SearchJobParams): Promise<any> => {
        try{
            let { job_keywords, remote, city } = searchJobParams;

            const baseQuery = `SELECT * 
            FROM jobs
            WHERE 
            active= true `;

            let extraQuery = '';

            if (typeof remote === 'boolean') extraQuery += ' AND remote= ' + remote;
            if (city) extraQuery += ` AND city= '${city}' `;

            
            let limit = 50;

            if (!job_keywords) {
                const queryRes = await executeQuerySync(baseQuery + extraQuery);

                return queryRes.rows;
            }

            job_keywords = job_keywords.trim();

            let query = ` AND title ~* '${job_keywords}' LIMIT ${limit}`;

            const queryRes = await executeQuerySync(baseQuery + extraQuery + query);
            
            limit -= queryRes.rows.length;

            if (limit <= 0) {
                return queryRes.rows;
            }

            let jobs: Array<JobRow> = queryRes.rows;

            let queries = [ ` AND description ~* '${job_keywords}' ` ];

            const kwdsArr = job_keywords.split(' ').sort((a, b) => b.length - a.length);

            if (kwdsArr.length > 1) {

                let titleQueries = []
                let descriptionQueries = [];
                
                for (let kwd of kwdsArr) {
                    titleQueries.push(` AND title ~* '${kwd}' `);
                    descriptionQueries.push(` AND description ~* '${kwd}' `);
                }

                queries = [ ...titleQueries, ...queries, ...descriptionQueries ];
            }

            let i = 0;
            let selectedJobs = jobs.map(j => j.job_id);

            while (limit > 0 && i < queries.length) {
                let excludePrevQueryPart = '';

                if (selectedJobs.length){
                    excludePrevQueryPart = ' AND job_id NOT IN ( ' + selectedJobs.toString() + ' ) ' 
                }
                const q = `${baseQuery} ${excludePrevQueryPart} ${extraQuery} ${queries[i]} LIMIT ${limit}`;

                const queryRes = await executeQuerySync(q);
                i++;
                limit -= queryRes.rows.length;

                console.log(`limit: ${limit} > i: ${i} > ${limit > 0} || ${i <= queries.length}`)

                if (queryRes.rows.length) {
                    const _rows: Array<JobRow> = queryRes.rows;
                    jobs = [ ...jobs, ...queryRes.rows ];
                    selectedJobs = [ ...selectedJobs, ..._rows.map(j => j.job_id) ];
                }
            }

            return jobs;

            
        } catch(e) {
            logger.error(beautifyError(e));
            throw e;
        }
    },
}