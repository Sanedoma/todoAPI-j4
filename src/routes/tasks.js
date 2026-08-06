const express = require("express");

const router = express.Router();
router.get("/", (req, res) => {

    res.json([
        {
            id: 1,
            title: "Apprendre Node.js",
            completed: false
        },
        {
            id: 2,
            title: "Créer une API",
            completed: true
        }
    ]);

});

module.exports = router;