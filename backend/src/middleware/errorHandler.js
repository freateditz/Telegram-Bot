const HttpError = require("../utils/httpError");

function notFoundHandler(req, res) {
    res.status(404).json({
        ok: false,
        error: "Not found",
        path: req.path,
    });
}

function errorHandler(error, req, res, next) {
    console.error("Backend error:", error);

    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
            ok: false,
            error: error.message,
            details: error.details,
        });
    }

    // CORS rejection — surface a 403 with a clear message rather than
    // a generic 500. The browser will swallow the body anyway, but
    // this helps when debugging with curl or in logs.
    if (error && /^CORS:/.test(error.message || "")) {
        return res.status(403).json({
            ok: false,
            error: error.message,
        });
    }

    if (error?.code === "P2002") {
        return res.status(409).json({
            ok: false,
            error: "Unique constraint violation",
            target: error.meta?.target || null,
        });
    }

    if (error?.code === "P2025") {
        return res.status(404).json({
            ok: false,
            error: "Record not found",
        });
    }

    res.status(500).json({
        ok: false,
        error: "Internal server error",
    });
}

module.exports = {
    notFoundHandler,
    errorHandler,
};