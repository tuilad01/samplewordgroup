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
        page = req.query.page ? parseInt(req.query.page) : 0,
        limit = req.query.limit ? parseInt(req.query.limit) : 100,
        fromDate = "",
        toDate = "",
        search = {};

    if (limit > 100) {
        limit = 100;
    }

    // Form Date
    if (req.query.fromdate) {
        let temp = req.query.fromdate.split("-");
        if (temp.length === 3) {
            fromDate = new Date(temp[0], temp[1] - 1, temp[2]); // YYYY-MM-DD
            //console.log(fromDate);
        }
    }

    // To Date
    if (req.query.todate) {
        let temp = req.query.todate.split("-");
        if (temp.length === 3) {
            toDate = new Date(temp[0], temp[1] - 1, temp[2]); // YYYY-MM-DD
            //console.log(toDate);
        }
    }

    // Property createdat search query add from date and to date 
    if (fromDate && toDate
        && fromDate instanceof Date
        && toDate instanceof Date) {
        search.createdAt = { $gte: fromDate, $lt: toDate };
    }

    // Search query Name 
    if (wordName) {
        search.name = { $regex: wordName, $options: "i" };
    }

    if (groupName) {
        search["groups.name"] = { $regex: groupName, $options: "i" };
    }

    try {
        const words = await wordModel.aggregate([
            // {
            //     $unwind: "$groups"
            // },
            {
                $lookup: {
                    from: "groups",
                    localField: "groups",
                    foreignField: "_id",
                    as: "groups"
                }
            },
            {
                $match: search // search
            },
            {
                $skip: page * limit // pagination skip
            }, {
                $limit: limit // pagination limit
            }
        ]);

        //console.log(words);
        res.json(words);
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

            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];

                await groupModel.findByIdAndUpdate({ _id: group }, { $push: { words: response._id } });
                //console.log(resGroup);
            }

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

router.put("/linkgroup", async (req, res, next) => {
    let arrError = [],
        groupSaved = [];

    const id = req.body._id;
    const arrWord = req.body.words;

    if (!id || !arrWord || !(arrWord instanceof Array)) {
        return res.json({
            error: ["request error"],
            saved: groupSaved
        });
    }

    const group = await groupModel.findById(id).populate("words");

    if (!group) {
        return res.json({
            error: ["group _id not found"],
            saved: groupSaved
        });
    }
    try {
        let temp = [...group.words.map(d => d.id)];
        temp = temp.concat(arrWord);

        // Distinct
        temp = temp.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        group.words = temp;

        // const response = await groupModel.update([
        //     { _id: id },
        //     { $push: { "words" :  arrWord }}
        // ]);

        const response = await group.save();
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
        return res.json({
            error: ["request error"],
            saved: wordSaved
        });
    }

    const groups = req.body.groups.trim() === "" ? [] : req.body.groups.split(",").map(d => d.trim());
    const name = req.body.name.trim();
    const mean = req.body.mean.trim();


    let arrError = [];
    let wordSaved = [];

    const word = await wordModel.findById(id);
    if (!word) {
        return res.json({
            error: ["word _id not found"],
            saved: wordSaved
        });
    }
    try {
        // TODO: Find all groups id not working

        const groupsOld = [...word.groups.map(d => d.id)];
        const groupNotUse = groupsOld.filter(d => {
            return groups.indexOf(d) === -1;
        });

        for (let i = 0; i < groupNotUse.length; i++) {
            const groupId = groupNotUse[i];

            await groupModel.findByIdAndUpdate({ _id: groupId }, { $pull: { words: response._id } }, { multi: true });
        }


        // for (let i = 0; i < word.groups.length; i++) {
        //     const group = word.groups[i];
        //     if ( !group ) continue;



        // }

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
    if (!id) return res.json({
        error: ["request error"],
        saved: wordSaved
    });

    let arrError = [];
    let wordSaved = [];

    const word = await wordModel.findById(id);
    if (!word) return res.json({
        error: ["word _id not found"],
        saved: wordSaved
    });

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