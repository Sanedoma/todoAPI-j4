const express = require("express");

const router = express.Router();

const tasks = require("../models/task");


router.get("/", (req, res) => {

    res.json(tasks);

});


module.exports = router;