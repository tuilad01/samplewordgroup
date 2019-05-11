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
    let id = req.query.id ? mongoose.Types.ObjectId(req.query.id.trim()) : "",
        groupName = req.query.name ? req.query.name.trim() : "",
        wordName = req.query.wordname ? req.query.wordname.trim() : "",
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
    if (groupName) {
        search.name = { $regex: groupName, $options: "i" };
    }

    if (wordName) {
        search["words.name"] = { $regex: wordName, $options: "i" };
    }

    //check group has in word
    if (req.query.haschild === "true") {
        search.words = { $exists: true, $ne: [] }
    } else if (req.query.haschild === "false") {
        search.words = { $exists: true, $eq: [] }
    }

    try {
        const groups = await groupModel.aggregate([
            // {
            //     $unwind: "$groups"
            // },
            {
                $lookup: {
                    from: "words",
                    localField: "words",
                    foreignField: "_id",
                    as: "words"
                }
            },
            {
                $match: id ? { _id: id } : search // search
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: page * limit // pagination skip
            }, {
                $limit: limit // pagination limit
            }
        ]);

        //console.log(groups);
        res.json(groups);
    } catch (error) {
        next(error);
    }
});

// define the about route
router.post('/', async (req, res, next) => {
    let arrError = [],
        groupSaved = [],
        groups = [],
        descriptions = [],
        words = [];

    if (req.body.words) {
        words = req.body.words.split(",").map(d => d.trim());
    }

    if (req.body.name) {
        groups = req.body.name.split(",").map(d => d.trim());
    }

    if (req.body.description) {
        descriptions = req.body.description.split(",").map(d => d.trim());
    }

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const description = descriptions[i];

        const groupNew = new groupModel({
            _id: new mongoose.Types.ObjectId(),
            name: group,
            description: description,
            words: words
        });

        try {
            const response = await groupNew.save();
            groupSaved.push(response);

            for (let i = 0; i < words.length; i++) {
                const word = words[i];

                await wordModel.findByIdAndUpdate({ _id: word }, { $push: { groups: response._id } });
                //console.log(resGroup);
            }

        } catch (error) {
            console.error(error);
            arrError.push(error.message);
        }
    }
    return res.json({
        error: arrError,
        saved: groupSaved
    });
});

router.put("/linkword", async (req, res, next) => {
    let arrError = [],
        wordSaved = [];

    const id = req.body._id;
    const arrGroup = req.body.groups;

    if (!id || !arrGroup || !(arrGroup instanceof Array)) {
        return res.json({
            error: ["request error"],
            saved: wordSaved
        });
    }

    const word = await wordModel.findById(id).populate("groups");

    if (!word) {
        return res.json({
            error: ["word _id not found"],
            saved: wordSaved
        });
    }


    try {
        for (let i = 0; i < arrGroup.length; i++) {
            const groupId = arrGroup[i];

            const res = await groupModel.findOneAndUpdate({ _id: groupId }, { $addToSet: { words: word._id } });
            if (!res && !res.id) {
                continue;
            }
            await wordModel.findOneAndUpdate({ _id: word._id }, { $addToSet: { groups: groupId } });

        }

        wordSaved.push(word);
    } catch (error) {
        console.error(error);
        arrError.push(error.message);
    }

    return res.json({
        error: arrError,
        saved: wordSaved
    });
});

router.put("/", async (req, res, next) => {
    const id = req.body._id;

    let arrError = [];
    let groupSaved = [];

    if (!id) {
        return res.json({
            error: ["request error"],
            saved: groupSaved
        });
    }

    const words = req.body.words.trim() === "" ? [] : req.body.words.split(",").map(d => d.trim());
    const name = req.body.name.trim();
    const description = req.body.description.trim();

    const group = await groupModel.findById(id).populate("words");
    if (!group) {
        return res.json({
            error: ["group _id not found"],
            saved: groupSaved
        });
    }
    try {
        // TODO: Find all words id not working

        const wordsOld = [...group.words.map(d => d.id)];
        const wordNotUse = wordsOld.filter(d => {
            return words.indexOf(d) === -1;
        });

        // Remove group from group when group not yet in group
        for (let i = 0; i < wordNotUse.length; i++) {
            const wordId = wordNotUse[i];
            if (!wordId) continue;

            await wordModel.findByIdAndUpdate({ _id: wordId }, { $pull: { groups: group._id } }, { multi: true });
        }

        // Add group in word
        for (let i = 0; i < words.length; i++) {
            const wordId = words[i];
            if (!wordId) continue;

            await wordModel.findOneAndUpdate({ _id: wordId }, { $addToSet: { groups: group._id } });
        }

        // Save detail group
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
        saved: groupSaved
    });

});

router.delete("/", async (req, res, next) => {
    const id = req.body._id;

    let arrError = [];
    let groupSaved = [];

    if (!id) return res.json({
        error: ["request error"],
        saved: groupSaved
    });



    const group = await groupModel.findById(id).populate("words");
    if (!group) return res.json({
        error: ["group _id not found"],
        saved: groupSaved
    });

    try {
        await groupModel.update({ _id: { $in: group.words } }, { $pull: { words: group._id } }, { multi: true });

        response = await group.remove();
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