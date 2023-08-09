if (process.env.Node_ENV != "production") require("dotenv").config()
const express = require("express")
const app = express()
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://inventoryapp-5900c.web.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
const cors = require("cors")
app.use(cors({ origin: 'https://inventoryapp-5900c.web.app' }))
app.use(express.urlencoded({ extended: true }))
const inventory = require("./routes/inventoryRoute")
const user = require("./routes/userRoute")
app.use("/store", inventory)
app.use("/user", user)
app.use(express.static('images'))
app.listen(process.env.PORT, () => { })