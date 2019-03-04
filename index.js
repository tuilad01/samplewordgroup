const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

/**
 * Route
 */
var wordRoute = require('./routes/word');
var groupRoute = require('./routes/group');


/**
 * Models
 */
const wordModel = require("./models/word");
const groupModel = require("./models/group");

const app = express();

/**
 * Mongoose connection
 */
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useCreateIndex: true, });


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static('assets'));

/**
 * Handle errors
 */
// app.use((err, req, res, next) => {
//     console.error(err);
//     res.status(500).json({ error: err.message });
// });

app.use('/word', wordRoute);
app.use('/group', groupRoute);


app.get("/", (req, res, next) => {    
    res.sendFile(__dirname + "/index.html");
});

app.listen(4200, () => {
    console.log("express running on http://localhost:4200/")
});
