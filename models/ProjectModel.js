const mongoose = require("mongoose");
const ProjectSchema = require("./ProjectSchema");

module.exports = mongoose.model("project", ProjectSchema);
