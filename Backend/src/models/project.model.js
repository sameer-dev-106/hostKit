import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    repoUrl: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: String,
        default: "main",
    },
    framework: {
        type: String,
        enum: ["node", "react", "next", "other"],
        default: "other",
    },
    envs: {
        type: Map,
        of: String,
        default: {},
    },
    status: {
        type: String,
        enum: ["pending", "building", "success", "failed"],
        default: "pending"
    }
},
    { timestamps: true, }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;