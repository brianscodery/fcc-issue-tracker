/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
const mongoose = require("mongoose");
const Project = require("../models/ProjectModel.js");
const Issue = require("../models/IssueModel.js");

module.exports = app => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    dbName: "fccAdvancedNode"
  };
  const connection = mongoose
    .connect(process.env.DB, options, err => {
      if (err) {
        console.error(err);
      } else {
        console.log("DB connected swell-like");
      }
    })
    .catch(err => console.error(err));

  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      const project = req.params.project;
      const retrievedProject = await Project.findOne({ project }).catch(err =>
        console.error(err)
      );
      const issues = retrievedProject.issues;
      let filteredIssues = issues;
      const queryEntries = Object.entries(req.query);
      queryEntries.forEach(queryEntry => {
        filteredIssues = filteredIssues.filter(
          ele => ele[queryEntry[0]] === queryEntry[1]
        );
      });
      if (retrievedProject) {
        res.json(filteredIssues);
        return;
      }
      res.send(`project ${project} doesn't exist`);
      return;
    })

    .post(async (req, res, next) => {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      const missingRequiredFields = [];
      if (!issue_title) {
        missingRequiredFields.push("issue_title");
      }
      if (!issue_text) {
        missingRequiredFields.push("issue_text");
      }
      if (!created_by) {
        missingRequiredFields.push("created_by");
      }
      if (missingRequiredFields.length) {
        const message = `Missing required fields: ${missingRequiredFields.join(
          ", "
        )}`;
        res.status(400).send(message);
        return;
      }
      const queryResult = await Project.findOne({ project }).catch(err =>
        console.error(err)
      );
      if (!queryResult) {
        const newProject = new Project({
          project,
          issues: [
            {
              issue_title,
              issue_text,
              created_by,
              assigned_to: assigned_to || "",
              status_text: status_text || ""
            }
          ]
        });
        await newProject.save().catch(err => console.error(err));
      } else {
        queryResult.issues.push({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || ""
        });

        await queryResult.save().catch(err => console.error(err));
        res.json(queryResult.issues[queryResult.issues.length - 1]);
        next();
      }
    })

    .put(async (req, res) => {
      const project = req.params.project;
      const _id = req.body._id;
      const update = getQueryObject(req.body);
      update.updated_on = new Date();
      if (!_id) {
        res.status(400).send("_id is required, plus at least one other field");
        return;
      }
      if (noInputFields(update)) {
        const retrievedProject = await Project.findOne({
          "issues._id": _id
        }).catch(err => console.error(err));
        const date = new Date();
        retrievedProject.issues.id(_id).set({ updated_on: date });
        res
          .status(400)
          .set("updated_on", date)
          .send("no updated field sent");
        return;
      }
      const retrievedProject = await Project.findOne({
        "issues._id": _id
      }).catch(err => console.error(err));
      retrievedProject.issues.id(_id).set(update);
      const updatedProject = await retrievedProject.save().catch(err => {
        console.error(err);
        res.status(400).send(`could not update ${_id}.`);
        return;
      });
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        updated_on
      } = updatedProject.issues.id(_id);
      res
        .status(200)
        .set({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          updated_on
        })
        .send("successfully updated");
      return;
    })

    .delete(async (req, res) => {
      const project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.status(400).send("_id error");
        return;
      }
      const retrievedProject = await Project.findOne({ project }).catch(err =>
        console.error(err)
      );
    console.log(retrievedProject);
      retrievedProject.issues.id(_id).remove();
    console.log(retrievedProject);
      retrievedProject.save(err => {
        if(err){
          res.status(400).send(`could not delete ${_id}`);
          return;
        }
      res.status(200).send(`deleted ${_id}`);
      return;
    });
  });

  const noInputFields = update => {
    return (
      !update.assigned_to &&
      !update.status_text &&
      !update.open &&
      !update.issue_title &&
      !update.issue_text &&
      !update.created_by
    );
  };

  const getQueryObject = body => {
    const {
      assigned_to,
      status_text,
      open,
      issue_title,
      issue_text,
      created_by
    } = body;
    return {
      ...(assigned_to && { assigned_to }),
      ...(status_text && { status_text }),
      ...(open && { open }),
      ...(issue_title && { issue_title }),
      ...(issue_text && { issue_text }),
      ...(created_by && { created_by })
    };
  };
}
