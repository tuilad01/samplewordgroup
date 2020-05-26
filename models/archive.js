const mongoose = require("mongoose");
const Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

const archiveSchema = Schema({
    _id: ObjectId,
    sysName: String,
    text: String,
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Archive", archiveSchema);