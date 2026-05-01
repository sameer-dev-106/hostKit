import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
});

export const deploymentQueue = new Queue("deployment-queue", {
    connection,
});

export default deploymentQueue;