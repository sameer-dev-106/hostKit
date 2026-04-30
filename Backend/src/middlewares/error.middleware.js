import dotenv from "dotenv";

dotenv.config();

function handleError(err, req, res, next) {
    const response = {
        success: false,
        message: err.message || "Internal Server Error",
    };

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(err.status || 500).json(response);
}

export default handleError;
