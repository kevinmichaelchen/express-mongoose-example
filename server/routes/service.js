import { nanoid } from "nanoid";
import createError from "http-errors";
import { getModels } from "../db";

export const getAllSteps = (req, res, next) => {
  const { Step } = getModels();
  Step.find({}, (err, arr) => {
    console.log("arr", arr);
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
    if (err) return console.error(err);
    console.log("Successfully saved:", step.toString());
  });

  res.send(inputBody);
};

export const deleteStep = (req, res, next) => {
  const { Step } = getModels();

  const { id } = req.params;

  Step.deleteOne({ id }, (err) => {
    if (err) {
      console.log("error", err);
      next(createError(500, "Error occurred while deleting Step"));
      return;
    }
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
    } else {
      res.send(doc);
    }
  });
};
