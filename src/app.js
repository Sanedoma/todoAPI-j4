const express = require("express");

const app = express();


const tasksRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");


app.use(express.json());


app.use("/api/tasks", tasksRoutes);


app.get("/", (req, res) => {
    res.send("Bienvenue sur la Todo API !");
});

app.use(errorHandler);
app.use(logger);
module.exports = app;