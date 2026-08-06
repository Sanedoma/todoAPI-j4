const express = require("express");

const app = express();


const tasksRoutes = require("./routes/tasks");


app.use(express.json());


app.use("/api/tasks", tasksRoutes);


app.get("/", (req, res) => {
    res.send("Bienvenue sur la Todo API !");
});


module.exports = app;