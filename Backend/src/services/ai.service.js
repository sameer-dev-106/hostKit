import axios from "axios";
import fs from "fs";
import path from "path";    

/**
 * @desc Analyze deployment logs using AI (Mistral)
 * @returns { errorType, explanation, fix, severity }
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
${logs.join('\n')}
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
            const cleanedOutput = output
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            parsed = JSON.parse(cleanedOutput);
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


/**
 * @desc Apply AI-suggested fix to project files (Dockerfile, package.json)
 * @returns true if fix applied, false otherwise
 */
export const applyAiFix = async (projectPath, aiResult) => {
    try {
        const fixPrompt = `
You are an expert DevOps engineer fixing a deployment error.

Error type: ${aiResult.errorType}
Fix needed: ${aiResult.fix}

Return ONLY a valid JSON object, nothing else:
{
  "fileToFix": "Dockerfile" or "package.json" or "none",
  "content": "complete file content to write"
}

Rules:
- If fix requires Dockerfile change, return full corrected Dockerfile
- If fix requires package.json change, return full corrected package.json  
- If nothing can be auto-fixed, return fileToFix as "none"
- Return ONLY JSON, no markdown, no explanation
`;

        const res = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            {
                model: "mistral-small",
                messages: [{ role: "user", content: fixPrompt }],
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
        const cleaned = output
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        const parsed = JSON.parse(cleaned);

        if (!parsed.fileToFix || parsed.fileToFix === "none") return false;

        const filePath = path.join(projectPath, parsed.fileToFix);
        fs.writeFileSync(filePath, parsed.content);
        return true;

    } catch (err) {
        console.log("Auto-fix failed:", err.message);
        return false;
    }
};
