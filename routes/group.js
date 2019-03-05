const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const wordModel = require("./../models/word");
const groupModel = require("./../models/group");

/**
 * Route for Group
 */

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

// define the home page route
router.get('/', async (req, res, next) => {
    try {
        const group = await groupModel.find({}).populate("words");;
        res.json(group);
    } catch (error) {
        next(error);
    }
});

// define the about route
router.post('/', async (req, res, next) => {
    const words = req.body.words.trim() === "" ? [] : req.body.words.split(",").map(d => d.trim());
    const name = req.body.name.trim();
    const description = req.body.description.trim();

    let arrError = [];
    let groupSaved = [];

    const groupNew = new groupModel({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        description: description,
        words: words
    });

    try {
        const response = await groupNew.save();
        groupSaved.push(response);
    } catch (error) {
        console.error(error);
        arrError.push(error.message);
    }
    return res.json({
        error: arrError,
        saved: groupSaved
    });

});

router.put("/", async (req, res, next) => {
    const id = req.body._id;
    if (!id) {
        return res.send({ error: "request error" });
    }

    const words = req.body.words.trim() === "" ? [] : req.body.words.split(",").map(d => d.trim());
    const name = req.body.name.trim();
    const description = req.body.description.trim();

    let arrError = [];
    let groupSaved = [];

    const group = await groupModel.findById(id);
    if (!group) {
        return res.send({ error: "group _id not found" });
    }
    try {
        group.name = name;
        group.description = description;
        group.words = words;

        const response = await group.save();
        groupSaved.push(response);
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
    let groupSaved = [];

    const group = await groupModel.findById(id);
    if (!group) return res.send({ error: "group _id not found" });

    try {
        const response = await group.remove();
        groupSaved.push(response);
    } catch (error) {
        console.error(error);
        arrError.push(error.message);
    }

    return res.json({
        error: arrError,
        saved: groupSaved
    });
});

module.exports = router