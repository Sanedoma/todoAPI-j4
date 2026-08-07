const client = require("prom-client");


// Collecte automatique des métriques Node.js
client.collectDefaultMetrics();




// Nombre de requêtes HTTP
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Nombre total de requêtes HTTP",
    labelNames: [
        "method",
        "route",
        "status"
    ]
});


// Durée des requêtes
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Durée des requêtes HTTP en secondes",
    labelNames: [
        "method",
        "route",
        "status"
    ],
    buckets: [
        0.1,
        0.3,
        0.5,
        1,
        2,
        5
    ]
});


// Middleware Express
const metricsMiddleware = (req, res, next) => {

    const start = process.hrtime();

    res.on("finish", () => {

        const duration = process.hrtime(start);
        const seconds =
            duration[0] +
            duration[1] / 1e9;

        const labels = {
            method: req.method,
            route: req.route
                ? req.route.path
                : req.path,
            status: res.statusCode
        };

        httpRequestCounter.inc(labels);
        httpRequestDuration.observe(
            labels,
            seconds
        );
    });

    next();
};


// Route /metrics
const metrics = async (req, res) => {

    res.setHeader(
        "Content-Type",
        client.register.contentType
    );

    res.send(
        await client.register.metrics()
    );
};

module.exports = {
    metricsMiddleware,
    metrics
};