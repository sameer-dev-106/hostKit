import IORedis from "ioredis";

const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

export default redis;