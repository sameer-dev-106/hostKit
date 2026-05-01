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
            enum: ["pending", "building", "running", "failed", "success"],
            default: "pending"
        },
        logs: {
            type: [String],
            default: [],
        },
        commitId: {
            type: String,
        },
    },
    { timestamps: true }
);

const Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;