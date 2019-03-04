const mongoose = require("mongoose");
const Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

const wordSchema = Schema({
    _id: ObjectId,
    name: { type: String, required: [true, 'Word name required'], unique: true},
    mean: String,
    createdAt: { type: Date, default: Date.now },
    groups: [{ type: ObjectId, ref: "Group"}]
});

module.exports = mongoose.model("Word", wordSchema);