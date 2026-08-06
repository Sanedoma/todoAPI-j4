const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {

    res.json({
        status: "ok",
        service: "todo-api",
        timestamp: new Date()

    });

});

module.exports = router;