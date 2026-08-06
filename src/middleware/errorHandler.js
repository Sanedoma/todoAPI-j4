const errorHandler = (err, req, res, next) => {

    console.error({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        message: err.message
    });

    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });


};

module.exports = errorHandler;