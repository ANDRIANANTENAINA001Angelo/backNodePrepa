const { connectDb } = require("./utils/connexionDB")
const cors= require('cors');

require("dotenv").config()
const PORT = process.env.PORT || 8080

const userRouter= require("./routes/users")

const express = require('express')
const app = express()

console.log(process.env.PORT)

connectDb().catch(err => { console.log(err); })

app.use(express.json())
    .use(cors())
    .use(userRouter)

    

app.get("/",(req,res)=>{
    res.send("<h1>Hello World</h1>")
})

app.listen(PORT, () => {
    console.log(`L'application est démarer sur http://localhost:${PORT} !`);
})

