const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["https://interview-ai-project-three.vercel.app",
            /\.vercel\.app$/
            ],
    credentials: true
}))


/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
app.get("/test-ai", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "user",
          content: "Say hello",
        },
      ],
    });

    res.json({
      success: true,
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("DeepSeek Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app
