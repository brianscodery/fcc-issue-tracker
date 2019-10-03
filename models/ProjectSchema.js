const Schema = require("mongoose").Schema;
const IssueSchema = require("./IssueSchema.js");

module.exports = new Schema({
  project: {
    type: String,
    required: true
  },
  issues: {
    type: [IssueSchema],
    required: true
  }
});
