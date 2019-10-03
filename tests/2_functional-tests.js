/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
const Project = require("../models/ProjectModel.js");
const Issue = require("../models/IssueModel.js");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("POST /api/issues/{project} => object with issue data", function() {
    test("Every field filled in", done => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 200);
          assert.equal(
            res.body.issue_title,
            "Title",
            'issue_title equals "Title"'
          );
          assert.equal(res.body.issue_text, "text", 'Issue text equals "text"');
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in",
            'created_by equals "Functional Test - Every field filled in"'
          );
          assert.equal(
            res.body.assigned_to,
            "Chai and Mocha",
            'assigned_to equals "Chai and Mocha"'
          );
          assert.equal(
            res.body.status_text,
            "In QA",
            'res.status_text equals "In QA"'
          );
          assert.exists(res.body.created_on, "res.body.created_on exists");
          assert.exists(res.body.updated_on, "res.body.updated_on exists");
          assert.exists(res.body.open, "res.body.open exists");
          assert.exists(res.body._id, "res.body._id exists");
          done();
        });
    });

    test("Every field filled in", done => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 200);
          assert.equal(
            res.body.issue_title,
            "Title",
            'issue_title equals "Title"'
          );
          assert.equal(res.body.issue_text, "text", 'Issue text equals "text"');
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in",
            'created_by equals "Functional Test - Every field filled in"'
          );
          assert.equal(res.body.assigned_to, "", "assigned_to is blank");
          assert.equal(
            res.body.status_text,
            "",
            "res.status_text equals is blank"
          );
          assert.exists(res.body.created_on, "res.body.created_on exists");
          assert.exists(res.body.updated_on, "res.body.updated_on exists");
          assert.exists(res.body.open, "res.body.open exists");
          assert.exists(res.body._id, "res.body._id exists");
          done();
        });
    });

    test("Missing required fields", done => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_text: "text",
          created_by: "Functional Test - Every field filled in"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(res.text, "Missing required fields: issue_title");
        });

      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          created_by: "Functional Test - Every field filled in"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(res.text, "Missing required fields: issue_text");
        });

      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(res.text, "Missing required fields: created_by");
        });

      chai
        .request(server)
        .post("/api/issues/test")
        .send({})
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(
            res.text,
            "Missing required fields: issue_title, issue_text, created_by"
          );
        });

      done();
    });
  });

  suite("PUT /api/issues/{project} => text", function() {
    test("No body", function(done) {
      chai
        .request(server)
        .put("/api/issues/test2")
        .send({})
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(
            res.text,
            "_id is required, plus at least one other field"
          );
        });
      done();
    });

    test("One field to update", done => {
      Project.findOne({ project: "test2" }, (err, retrievedProject) => {
        const newIssue = new Issue({
          issue_title: "a title",
          issue_text: "some text",
          created_by: "me",
          assigned_to: "",
          status_text: ""
        });
        retrievedProject.issues.push(newIssue);
        retrievedProject.save((err, savedProject) => {
          chai
            .request(server)
            .put("/api/issues/test2")
            .send({
              _id: newIssue.id,
              issue_title: "a different title"
            })
            .end((err, res) => {
              if (err) {
                console.error(err);
              }

              assert.equal(res.status, 200);
              assert.equal(res.text, "successfully updated");
              assert.equal(res.headers.issue_text, "some text");
              assert.equal(res.headers.issue_title, "a different title");

              assert.equal(res.headers.created_by, "me");
              assert.equal(res.headers.assigned_to, "");
              assert.equal(res.headers.status_text, "");
              assert.approximately(
                new Date(res.headers.updated_on).getTime(),
                new Date().getTime(),
                15000
              );
              done();
            });
        });
      });
    });

    test("Multiple fields to update", done => {
      Project.findOne({ project: "test2" }, (err, retrievedProject) => {
        const newIssue = new Issue({
          issue_title: "a different title",
          issue_text: "some other text",
          created_by: "me too",
          assigned_to: "Brian",
          status_text: ""
        });
        retrievedProject.issues.push(newIssue);
        retrievedProject.save((err, savedProject) => {
          chai
            .request(server)
            .put("/api/issues/test2")
            .send({
              _id: newIssue.id,
              issue_title: "another different title",
              issue_text: "some different other text",
              created_by: "me also too",
              status_text: "not blank"
            })
            .end((err, res) => {
              if (err) {
                console.error(err);
              }

              assert.equal(res.status, 200);
              assert.equal(res.text, "successfully updated");
              assert.equal(res.headers.issue_text, "some different other text");
              assert.equal(res.headers.issue_title, "another different title");

              assert.equal(res.headers.created_by, "me also too");
              assert.equal(res.headers.assigned_to, "Brian");
              assert.equal(res.headers.status_text, "not blank");
              assert.approximately(
                new Date(res.headers.updated_on).getTime(),
                new Date().getTime(),
                15000
              );
              done();
            });
        });
      });
    });
    test("No _id", function(done) {
      chai
        .request(server)
        .put("/api/issues/test2")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end((err, res) => {
          if (err) {
            console.error(err);
          }
          assert.equal(res.status, 400);
          assert.equal(
            res.text,
            "_id is required, plus at least one other field"
          );
        });
      done();
    });

    test("Only _id", done => {
      Project.findOne({ project: "test2" }, (err, retrievedProject) => {
        const newIssue = new Issue({
          issue_title: "a different title",
          issue_text: "some other text",
          created_by: "me too",
          assigned_to: "Brian",
          status_text: ""
        });
        retrievedProject.issues.push(newIssue);
        retrievedProject.save((err, savedProject) => {
          chai
            .request(server)
            .put("/api/issues/test2")
            .send({ _id: newIssue._id })
            .end((err, res) => {
              if (err) {
                console.error(err);
              }
              assert.equal(res.status, 400);
              assert.equal(res.text, "no updated field sent");
              assert.approximately(
                new Date(res.headers.updated_on).getTime(),
                new Date().getTime(),
                15000
              );
            });
          done();
        });
      });
    });
  });

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function() {
      test("No filter", done => {
        chai
          .request(server)
          .get("/api/issues/test3")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            const issues = res.body;
            assert.isArray(issues);
            issues.forEach(issue => {
              assert.property(issue, "issue_title");
              assert.property(issue, "issue_text");
              assert.property(issue, "created_on");
              assert.property(issue, "updated_on");
              assert.property(issue, "created_by");
              assert.property(issue, "assigned_to");
              assert.property(issue, "open");
              assert.property(issue, "status_text");
              assert.property(issue, "_id");
            });
            done();
          });
      });

      test("One filter", done => {
        chai
          .request(server)
          .get("/api/issues/test3")
          .query({ assigned_to: "Brian" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            const issues = res.body;
            assert.isArray(issues);
            issues.forEach(issue => {
              assert.equal(issue.assigned_to, "Brian");
            });
          });

        chai
          .request(server)
          .get("/api/issues/test3")
          .query({ issue_title: "another different title" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            const issues = res.body;
            assert.isArray(issues);
            issues.forEach(issue => {
              assert.equal(issue.issue_title, "another different title");
            });
          });
        done();
      });

      test("Multiple filters (test for multiple fields you know will be in the db for a return)", done => {
        chai
          .request(server)
          .get("/api/issues/test3")
          .query({
            assigned_to: "Brian",
            issue_title: "another different title"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            const issues = res.body;
            assert.isArray(issues);
            issues.forEach(issue => {
              assert.equal(issue.assigned_to, "Brian");
              assert.equal(issue.issue_title, "another different title");
            });
          });
        done();
      });
    }
  );

  suite("DELETE /api/issues/{project} => text", function() {
    test("No _id", done => {
      chai
        .request(server)
        .delete("/api/issues/test3")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.text, "_id error");
          done();
        });
    });

    test("Valid _id", done => {
      Project.findOne({ project: "test3" }, (err, retrievedProject) => {
        const newIssue = new Issue({
          issue_title: "a title",
          issue_text: "some text",
          created_by: "me",
          assigned_to: "",
          status_text: ""
        });
        retrievedProject.issues.push(newIssue);
        retrievedProject.save((err, savedProject) => {
          chai
            .request(server)
            .delete("/api/issues/test3")
            .send({ _id: newIssue._id })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, `deleted ${newIssue._id}`);
              done();
            });
        });
      });
    });
  });
});
