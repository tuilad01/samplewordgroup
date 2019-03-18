const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const wordModel = require("./../models/word");
const groupModel = require("./../models/group");

/**
 * Route for Word
 */

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

// define the home page route
router.get('/', async (req, res, next) => {
    let wordName = req.query.name ? req.query.name.trim() : "",
        groupName = req.query.groupname ? req.query.groupname.trim() : "",
        fromDate = "",
        toDate = "",
        search = {};

    // Form Date
    if ( req.query.fromdate ) {
        let temp = req.query.fromdate.split("/");
        if (temp.length === 3 ) { 
            fromDate = new Date(temp[2], temp[0] - 1, temp[1]); // YYYY-MM-DD
            console.log(fromDate);
        } 
    }

    // To Date
    if ( req.query.todate ) {
        let temp = req.query.todate.split("/");
        if (temp.length === 3 ) { 
            toDate = new Date(temp[2], temp[0] - 1, temp[1]); // YYYY-MM-DD
            console.log(toDate);
        } 
    }

    // Property createdat search query add from date and to date 
    if ( fromDate && toDate 
        && fromDate instanceof Date 
        && toDate instanceof Date ) {
            search.createdAt = { "$gte": fromDate, "$lt": toDate };
    }

    // Search query Name 
    if ( wordName ) {
        search.name = { "$regex": wordName, "$options": "i" };
    }

    // if ( groupName ) {        
    // }

    try {
        const words = await wordModel.find(search).populate("groups");;
        return res.json(words);
    } catch (error) {
        next(error);
    }
});

// define the about route
router.post('/', async (req, res, next) => {
    let arrError = [],
        wordSaved = [],
        groups = [],
        words = [],
        means = [];

    if (req.body.groups) {
        groups = req.body.groups.split(",").map(d => d.trim());
    }

    if (req.body.name) {
        words = req.body.name.split(",").map(d => d.trim());
    }

    if (req.body.mean) {
        means = req.body.mean.split(",").map(d => d.trim());
    }



    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const mean = means[i];

        const wordNew = new wordModel({
            _id: new mongoose.Types.ObjectId(),
            name: word,
            mean: mean,
            groups: groups
        });

        try {
            const response = await wordNew.save();
            wordSaved.push(response);
        } catch (error) {
            console.error(error);
            arrError.push(error.message);
        }
    }
    return res.json({
        error: arrError,
        saved: wordSaved
    });

});

router.put("/", async (req, res, next) => {
    const id = req.body._id;
    if (!id) {
        return res.send({ error: "request error" });
    }

    const groups = req.body.groups.trim() === "" ? [] : req.body.groups.split(",").map(d => d.trim());
    const name = req.body.name.trim();
    const mean = req.body.mean.trim();


    let arrError = [];
    let wordSaved = [];

    const word = await wordModel.findById(id);
    if (!word) {
        return res.send({ error: "word _id not found" });
    }
    try {
        word.name = name;
        word.mean = mean;
        word.groups = groups;

        const response = await word.save();
        wordSaved.push(response);
    } catch (error) {
        console.error(error);
        arrError.push(error.message);
    }

    return res.json({
        error: arrError,
        saved: wordSaved
    });

});

router.delete("/", async (req, res, next) => {
    const id = req.body._id;
    if (!id) return res.send({ error: "request error" });

    let arrError = [];
    let wordSaved = [];

    const word = await wordModel.findById(id);
    if (!word) return res.send({ error: "word _id not found" });

    try {
        const response = await word.remove();
        wordSaved.push(response);
    } catch (error) {
        console.error(error);
        arrError.push(error.message);
    }

    return res.json({
        error: arrError,
        saved: wordSaved
    });
});

module.exports = router