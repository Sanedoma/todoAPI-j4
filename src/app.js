require("dotenv").config({
    path: process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env",
    override: true
});

const express = require("express");

const app = express();


const tasksRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const healthRouter = require("./routes/health");


app.use(express.json());
app.use(logger);

app.use("/health", healthRouter);

app.use("/api/tasks", tasksRoutes);


app.get("/", (req, res) => {
    res.send("Bienvenue sur la Todo API !");
});

app.use(errorHandler);
module.exports = app;