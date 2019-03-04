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
    try {
        const group = new groupModel({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            description: req.body.description,
            groups: req.body.groups
        });

        const response = await group.save();
        res.json(response);
    } catch (error) {
        next(error);
    }
});

// router.put("/", (req, res, next) => {
//     res.send('Birds home page')
// });

// router.delete("/", (req, res, next) => {
//     res.send('Birds home page')
// });

router.post("/create", (req, res, next) => {
    res.send('Birds home page')
});



module.exports = router