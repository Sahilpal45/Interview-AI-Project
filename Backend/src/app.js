const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { GoogleGenAI } = require("@google/genai")

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
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})
app.get("/test-gemini", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello"
    });

    res.send(response.text);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app
