const pool = require("./db");


pool.query("SELECT NOW()")

    .then(result => {

        console.log(result.rows);

        process.exit();

    })

    .catch(error => {

        console.error(error);

        process.exit(1);

    });