const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const archiveModel = require("./../models/archive");

const SYSNAME = "CELLPHONE"

/**
 * Route for Archive
 */

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

// define the home page route
router.get('/', async (req, res, next) => {
    try {
        let query = archiveModel
            .findOne({ sysName: SYSNAME })
            .select('text updatedAt')

        const result = await query.exec();
        return res.json(result);
    } catch (error) {
        next(error);
    }
});


router.put("/", async (req, res, next) => {
    const textArchive = req.body.text.trim()

    const archive = await archiveModel
        .findOne({ sysName: SYSNAME });

    try {
        if (!archive) {
            const archiveNew = new archiveModel({
                _id: new mongoose.Types.ObjectId(),
                sysName: SYSNAME,
                text: textArchive
            });

            const response = await archiveNew.save();

            return res.json(response);
        }     

        // Save archive
        archive.text = textArchive;
        archive.updatedAt = Date.now();

        const response = await archive.save();

        return res.json(response);
    } catch (error) {
        console.error(error);
        return res.json(error);
    }
});


module.exports = router