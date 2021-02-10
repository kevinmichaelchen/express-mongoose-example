import { nanoid } from "nanoid";
import createError from "http-errors";
import { getModels } from "../db";
import { getPaginationParams } from "./query-params";
import mongoose from "mongoose";

export const getAllSteps = (req, res, next) => {
  const { Step } = getModels();

  // Get URL parameters related to pagination
  const { query } = req;

  console.log("getting pagination params");

  const { forward, cursor, limit } = getPaginationParams(query);

  console.log("skerr");

  let paginationOpts = {
    sort: { id: forward ? 1 : -1 },
    limit,
  };

  console.log("Querying with pagination options:", paginationOpts);

  if (forward) {
    paginationOpts = { ...paginationOpts, startingAfter: cursor };
  } else {
    paginationOpts = { ...paginationOpts, endingBefore: cursor };
  }

  console.log("Querying with pagination options:", paginationOpts);

  mongoose.model("Step").paginate({}, paginationOpts, (err, results) => {
    if (err) {
      console.log("Failed to get Steps", err);
      next(createError(500, "Error occurred while getting Steps"));
      return;
    }
    console.log("Successfully retrieved Steps");
    res.send(results);
  });
};

export const deleteAllSteps = (req, res, next) => {
  const { Step } = getModels();
  Step.deleteMany({}, (err) => {
    if (err) {
      console.log("Failed to delete Steps", err);
      next(createError(500, "Error occurred while deleting Steps"));
      return;
    }
    res.send({ success: true });
  });
};

export const createStep = (req, res, next) => {
  const { Step } = getModels();

  const { body } = req;
  const { title } = body;

  const inputBody = { id: nanoid(), title };

  // Create new object
  const step = new Step(inputBody);
  console.log("Saving", step.toString());

  // Save object to database
  step.save((err, step) => {
    if (err) {
      console.log("Failed to create Step", err);
      next(createError(500, "Error occurred while saving Step"));
      return;
    }
    console.log("Successfully saved:", step.toString());
  });

  res.send(inputBody);
};

export const updateStep = (req, res, next) => {
  const { Step } = getModels();

  const { params, body } = req;
  const { id } = params;
  const { title } = body;

  const update = { title };
  const options = { new: true, multi: false };

  console.log(`Updating Step ${id}...`);

  Step.findByIdAndUpdate(id, update, options, (err, doc) => {
    if (err) {
      console.log("Failed to update Step", err);
      next(createError(500, "Error occurred while updating Step"));
      return;
    }
    console.log("Successfully updated Step");
    res.send(doc);
  });
};

export const deleteStep = (req, res, next) => {
  const { Step } = getModels();

  const { id } = req.params;

  Step.deleteOne({ id }, (err) => {
    if (err) {
      console.log("Failed to delete Step", err);
      next(createError(500, "Error occurred while deleting Step"));
      return;
    }
    console.log("Successfully deleted Step");
  });
};

export const getStep = (req, res, next) => {
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
    }
    console.log("Successfully retrieved Step");
    res.send(doc);
  });
};
