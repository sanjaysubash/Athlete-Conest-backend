const express = require("express")
const app = express()

app.get("/",async (req,res)=>{
    res.status(200).send({"data":"hai from server"})
})
app.listen(3000,()=>{
    console.log("running in 3000")
})