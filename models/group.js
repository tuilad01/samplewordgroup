const mongoose = require("mongoose");
const Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

const groupSchema = Schema({
    _id: ObjectId,
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    words: [{ type: ObjectId, ref: "Word"}]
});

module.exports = mongoose.model("Group", groupSchema);