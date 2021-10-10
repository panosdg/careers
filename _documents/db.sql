CREATE TABLE users (
	user_id serial PRIMARY KEY,
	name VARCHAR ( 50 ) NOT NULL,
	surname VARCHAR ( 50 ) NOT NULL,
	password VARCHAR ( 50 ) NOT NULL,
	email VARCHAR ( 255 ) UNIQUE NOT NULL,
	created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP 
);

CREATE INDEX ON users (email);

CREATE TABLE companies (
	company_id serial PRIMARY KEY,
	user_id integer REFERENCES users (user_id),
	active BOOLEAN NOT NULL,
	name VARCHAR ( 50 ) NOT NULL,
	description VARCHAR ( 250 ) NOT NULL,
	city VARCHAR ( 50 ) NOT NULL,
	industry VARCHAR ( 50 ) NOT NULL,
	created_on TIMESTAMP NOT NULL,
    last_modified TIMESTAMP 
);

CREATE TABLE jobs (
	job_id serial PRIMARY KEY,
	company_id integer REFERENCES companies (company_id),
	active BOOLEAN NOT NULL,
	title VARCHAR ( 50 ) NOT NULL,
	description VARCHAR ( 250 ) NOT NULL,
	city VARCHAR ( 50 ) NOT NULL,
	remote BOOLEAN NOT NULL,
	created_on TIMESTAMP NOT NULL,
    last_modified TIMESTAMP 
);