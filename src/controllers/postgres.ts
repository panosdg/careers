const { Client } = require('pg');

const connect = () => {
    try {
        const connectionString = process.env.DB_CONN;
        let client = new Client({ connectionString, });

        client.connect();
        return client;
    } catch (e) {
        console.log(">>>> UNABLE TO CONNECT >>>")
        console.log(e);
        process.exit();
    }
}



export default connect();