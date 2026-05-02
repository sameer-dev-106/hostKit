import mongoose from "mongoose";

const deploymentLogSchema = new mongoose.Schema({
    deploymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deployment",
        index: true,
    },
    message: {
        type: String,
    },
}, { timestamps: true });

const DeploymentLog = mongoose.model("DeploymentLog", deploymentLogSchema);

export default DeploymentLog;