import { nanoid } from "nanoid";
import createError from "http-errors";
import express from "express";
var router = express.Router();

import { getModels, getDB } from "../db";

/* GET /steps */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* GET /steps/1 */
router.get("/:id", function (req, res, next) {
  const { Step } = getModels();

  const { id } = req.params;

  Step.findOne({ id }, (err, doc) => {
    if (!doc) {
      next(createError(404, "Step not found"));
      return;
    } else if (err) {
      console.log("error", err);
      next(createError(500, "Error occurred while retrieving Step"));
      return;
    } else {
      res.send(doc);
    }
  });
});

/* POST /steps */
router.post("/", function (req, res, next) {
  const { Step } = getModels();

  const { body } = req;
  const { title } = body;

  const inputBody = { id: nanoid(), title };

  // Create new object
  const step = new Step(inputBody);
  console.log("Saving", step.toString());

  // Save object to database
  step.save((err, step) => {
    if (err) return console.error(err);
    console.log("Successfully saved:", step.toString());
  });

  res.send(inputBody);
});

module.exports = router;
