require("dotenv").config({
    path: process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env",
});

const express = require("express");

const app = express();


const tasksRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const healthRouter = require("./routes/health");
const { metricsMiddleware, metrics } = require("./middleware/metrics");


app.use(express.json());
app.use(logger);
app.use(metricsMiddleware);

app.use("/health", healthRouter);

console.log("metrics route loaded");
app.get("/metrics", metrics);

app.use("/api/tasks", tasksRoutes);


app.get("/", (req, res) => {
    res.send("Bienvenue sur la Todo API !");
});

app.use(errorHandler);
module.exports = app;