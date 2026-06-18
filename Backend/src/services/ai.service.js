const OpenAI = require("openai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const interviewReportSchema = z.object({
    matchScore: z.number(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string(),
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"]),
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string()),
        })
    ),

    title: z.string(),
});

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    try {
        const prompt = `
Generate an interview report for a candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return ONLY valid JSON in the following format:

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": ["", ""]
    }
  ],
  "title": ""
}
`;

        const response = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert technical interviewer and career coach. Return ONLY valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            response_format: {
                type: "json_object",
            },
        });

        const content = response.choices[0].message.content;

        const parsed = JSON.parse(content);

        interviewReportSchema.parse(parsed);

        return parsed;
    } catch (error) {
        console.error("generateInterviewReport Error:", error);
        throw error;
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    try {
        const prompt = `
Generate a professional ATS-friendly resume.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:
- Tailor resume for the job description
- ATS friendly
- Professional formatting
- 1-2 pages maximum
- Highlight relevant skills
- Highlight relevant projects
- Include measurable achievements when possible
- Do not sound AI-generated

Return ONLY JSON:

{
  "html": "<complete html document>"
}
`;

        const response = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional resume writer. Return ONLY valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            response_format: {
                type: "json_object",
            },
        });

        const content = response.choices[0].message.content;

        const parsed = JSON.parse(content);

        if (!parsed.html) {
            throw new Error("No HTML returned from model");
        }

        const pdfBuffer = await generatePdfFromHtml(parsed.html);

        return pdfBuffer;
    } catch (error) {
        console.error("generateResumePdf Error:", error);
        throw error;
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};
