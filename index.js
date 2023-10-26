if (process.env.Node_ENV != "production") require("dotenv").config()
const express = require("express")
// var path = require('path');
const app = express()
const cors = require("cors")
app.use(cors())
app.use(express.urlencoded({ extended: true }))
const inventory = require("./routes/inventoryRoute")
const user = require("./routes/userRoute")
const { Inventory } = require("./models/inventoryModel")
app.use("/store", inventory)
app.use("/user", user)
// app.use(express.static(path.join(__dirname, 'images')))
app.listen(process.env.PORT, () => { })