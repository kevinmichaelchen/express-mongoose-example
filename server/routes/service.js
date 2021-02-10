import { nanoid } from "nanoid";
import createError from "http-errors";
import { getModels } from "../db";

export const getAllSteps = (req, res, next) => {
  const { Step } = getModels();
  Step.find({}, (err, arr) => {
    if (err) {
      console.log("Failed to get Steps", err);
      next(createError(500, "Error occurred while getting Steps"));
      return;
    }
    console.log("Successfully retrieved Steps");
    res.send(arr);
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
