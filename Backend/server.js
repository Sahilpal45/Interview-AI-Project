require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()
const PORT = process.env.PORT || 3000;
console.log("Mongo URI:", process.env.MONGO_URI);
app.listen(PORT, () => {
    console.log("Server is running on port 3000")
})
