 // User Name : KIITSwap
// Password : pgZgJpO4KPFvXcq8

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const homeRouter = require('./routers/homeRouter')
const ejs = require("ejs");
const port = process.env.port||8080;

const app = express();

// Connect Database
mongoose.connect('mongodb+srv://KIITSwap:pgZgJpO4KPFvXcq8@kiitswap.0aj0duu.mongodb.net/?retryWrites=true&w=majority&appName=KIITSwap', {useNewUrlParser:true});
const db = mongoose.connection;
db.on("error", ()=>{console.log("error");})
db.once("open", ()=>{console.log("connected");})
app.set('view engine', 'ejs');-
app.use(express.static("./public"));

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/', homeRouter)

app.listen(port, () => {
    console.log("Listen on the port 8080");
});

// Assuming you're using Express:
app.get('/main', (req, res) => {
    // Render main.ejs with title or any data you need
    res.render('main', { title: "KIIT Swap" });
  });
