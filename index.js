const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
/**
 * Route
 */
var wordRoute = require('./routes/word');
var groupRoute = require('./routes/group');
var archiveRoute = require('./routes/archive');


/**
 * Models
 */
// const wordModel = require("./models/word");
// const groupModel = require("./models/group");

const app = express();

app.use(cors());

/**
 * Mongoose connection
 */
mongoose.connect('mongodb://admin:dbadmin123@ds151840.mlab.com:51840/dbword93822112018', { useNewUrlParser: true, useCreateIndex: true, });
//mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useCreateIndex: true, });


app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}))

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(express.static('assets'));

// toLowerCase Key object
app.use(function (req, res, next) {
    for (var key in req.query) {
        req.query[key.toLowerCase()] = req.query[key];
    }
    next();
});

/**
 * Handle errors
 */
// app.use((err, req, res, next) => {
//     console.error(err);
//     res.status(500).json({ error: err.message });
// });

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header('Access-Control-Allow-Methods', '*');
//     res.header("Access-Control-Allow-Headers", "*");
//     next();
// });

app.use('/word', wordRoute);
app.use('/group', groupRoute);
app.use('/archive', archiveRoute);


app.get("/", (req, res, next) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
    console.log(`express running on http://localhost:${PORT}/`)
});
