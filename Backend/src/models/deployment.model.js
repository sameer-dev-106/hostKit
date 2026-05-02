import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        url: {
            type: String
        },
        port: {
            type: Number
        },
        containerId: {
            type: String
        },
        status: {
            type: String,
            enum: ["pending", "building", "running", "failed", "success", "stopped"],
            default: "pending"
        },
        commitId: {
            type: String,
        },
        aiAnalysis: {
            error: String,
            explanation: String,
            fix: String,
            severity: String
        }
    },
    { timestamps: true }
);

const Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;