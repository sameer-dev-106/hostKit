import axios from "axios";

/**
 * @desc Analyze deployment logs using AI (Mistral)
 */
export const analyzeError = async ({ logs, framework, files = [], missingEnvs = [] }) => {
    try {

        const prompt = `
You are an expert DevOps AI.

Analyze the deployment failure and return ONLY JSON.

Format:
{
  "errorType": "",
  "explanation": "",
  "fix": "",
  "severity": "low | medium | high"
}

Context:
- Framework: ${framework}
- Project files: ${JSON.stringify(files)}

Missing ENV Variables:
${missingEnvs?.join(", ") || "None"}

Rules:
- Be concise
- Identify exact root cause
- Suggest actionable fix
- Detect:
  - missing env variables
  - missing build folder (dist / build)
  - missing start script
  - case sensitivity issues (Linux)
- Do NOT return anything except JSON

Logs:
${logs}
`;

        const res = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            {
                model: "mistral-small",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const output = res.data.choices[0].message.content;

        let parsed;

        try {
            parsed = JSON.parse(output);
        } catch {
            // fallback if JSON breaks
            parsed = {
                errorType: "UNKNOWN",
                explanation: output,
                fix: "Check logs manually",
                severity: "medium"
            };
        }

        return parsed;

    } catch (err) {
        console.log("AI ERROR:", err.message);

        return {
            errorType: "AI_FAILED",
            explanation: "Could not analyze logs",
            fix: "Check logs manually",
            severity: "medium"
        };
    }
};
