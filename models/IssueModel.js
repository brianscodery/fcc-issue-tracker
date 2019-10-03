const mongoose = require("mongoose");
const IssueSchema = require("./IssueSchema.js");

module.exports = mongoose.model("issue", IssueSchema);
