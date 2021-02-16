import { v4 as uuidv4 } from "uuid";
import createError from "http-errors";
import { getModels } from "../db";
import { getPaginationParams } from "./query-params";
import mongoose from "mongoose";

const newID = () => uuidv4();

export const getAllSteps = async (req, res, next) => {
  const { Step } = getModels();

  try {
    const steps = await Step.find({}).exec();
    res.send(steps);
  } catch (err) {
    console.error(err);
    internalErr(next)(err)("Error occurred while finding all Steps");
    return;
  }
};

export const deleteAllSteps = async (req, res, next) => {
  const { Step } = getModels();

  try {
    await Step.deleteMany({});
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    internalErr(next)(err)("Error occurred while deleting all Steps");
    return;
  }
};

export const appendStep = async (req, res, next) => {
  const { Step } = getModels();

  const { body } = req;
  console.log("body", body);
  const {
    data_block: { title, instruction, audio_instruction },
    media_block: {
      image_urls,
      video_urls,
      highlight_block: {
        banner_image_url,
        profile_image_url,
        recipe_tutorial_video_url,
      },
    },
  } = body;

  // Find the last step!
  let newStepResponse;
  let steps;
  try {
    steps = await Step.find({}).exec().catch(console.error);
    console.log("steps", steps);
  } catch (err) {
    console.error(err);
    next(
      createError(
        500,
        "Error occurred while getting all Steps" + JSON.stringify(err)
      )
    );
    return;
  }

  try {
    const isFirstStep = steps.length === 0;

    const formerLastStep = await Step.findOne({ next_step_id: "" })
      .exec()
      .catch(console.error);
    const prevStepID = isFirstStep ? "" : formerLastStep.id;

    // Create new step body
    const newStepBody = {
      id: newID(),
      next_step_id: "",
      prev_step_id: prevStepID,
      data_block: {
        // Increment the number!
        number: isFirstStep ? 1 : formerLastStep.data_block.number + 1,
        title,
        instruction,
        audio_instruction,
      },
      media_block: {
        image_urls,
        video_urls,
        highlight_block: {
          banner_image_url,
          profile_image_url,
          recipe_tutorial_video_url,
        },
      },
    };

    // Save new Step to database
    const newStep = new Step(newStepBody);
    try {
      newStepResponse = await newStep.save();
    } catch (err) {
      console.error(err);
      next(
        createError(
          500,
          "Error occurred while saving new last Step" + JSON.stringify(err)
        )
      );
      return;
    }

    if (!isFirstStep) {
      try {
        formerLastStep.next_step_id = newStepBody.id;
        await formerLastStep.save();
      } catch (err) {
        console.error(err);
        next(
          createError(
            500,
            "Error occurred while saving penultimate Step:" +
              JSON.stringify(err)
          )
        );
        return;
      }
    }
  } catch (err) {
    console.error(err);
    next(
      createError(
        500,
        "Error occurred while saving penultimate Step: " + JSON.stringify(err)
      )
    );
    return;
  }

  res.send(newStepResponse);
};

export const createStep = async (req, res, next) => {
  const { Step } = getModels();

  const { body, query } = req;
  const {
    data_block: { title, instruction, audio_instruction },
    media_block: {
      image_urls,
      video_urls,
      highlight_block: {
        banner_image_url,
        profile_image_url,
        recipe_tutorial_video_url,
      },
    },
  } = body;

  // The index of the Step that we want to insert the new step after
  const after = query.after;
  const isPrepend = !after;

  let newStepResponse;

  try {
    const previousStep = await Step.findOne({ id: after }).exec();
    if (!previousStep) {
      next(createError(404, "Previous Step not found"));
      return;
    }

    // Get previous step's number!
    const prevNumber = previousStep.data_block.number;
    const nextStepID = previousStep.next_step_id;

    // Create new step body
    const newStepBody = {
      id: newID(),
      next_step_id: nextStepID,
      prev_step_id: previousStep.id,
      data_block: {
        // Increment the number!
        number: prevNumber + 1,
        title,
        instruction,
        audio_instruction,
      },
      media_block: {
        image_urls,
        video_urls,
        highlight_block: {
          banner_image_url,
          profile_image_url,
          recipe_tutorial_video_url,
        },
      },
    };

    // Updating prev.next
    previousStep.next_step_id = newStepBody.id;

    // Save previous Step to database
    try {
      await previousStep.save();
    } catch (err) {
      console.log("Failed to save previous Step", err);
      next(createError(500, "Error occurred while saving previous Step"));
      return;
    }

    // Create new object
    const newStep = new Step(newStepBody);
    console.log("Saving", newStep.toString());

    // Save new Step to database
    try {
      newStepResponse = await newStep.save();
    } catch (err) {
      next(createError(500, "Error occurred while saving Step"));
      return;
    }

    // TODO for all subsequent Steps, increment the number field
    // TODO will need a transaction here to ensure atomicity for all updates
    // This is where using an array in a parent document would reduce the # of DB trips

    let currentStepID = nextStepID;
    let prevStepID = newStepBody.id;

    // While there's a next step...
    while (!!currentStepID) {
      try {
        // Look up next step...
        const currentStep = await Step.findOne({ id: currentStepID }).exec();
        if (!currentStep) {
          notFoundErr(next)({})(`Step ${currentStepID} not found`);
          return;
        }

        // Update number
        currentStep.data_block.number = currentStep.data_block.number + 1;

        // Update previous reference
        currentStep.prev_step_id = prevStepID;

        // Save current step
        try {
          await currentStep.save();
        } catch (err) {
          next(createError(500, "Error occurred while saving Step"));
          return;
        }

        // Update pointers
        currentStepID = currentStep.next_step_id;
        prevStepID = currentStep.prev_step_id;
      } catch (err) {
        // TODO return err
      }
    }
  } catch (err) {
    next(createError(500, "Error occurred while retrieving previous Step"));
    return;
  }

  res.send(newStepResponse);
};

export const updateStep = async (req, res, next) => {
  const { Step } = getModels();

  const { params, body } = req;
  const { id } = params;
  const {
    data_block: { title, instruction, audio_instruction },
    media_block: {
      image_urls,
      video_urls,
      highlight_block: {
        banner_image_url,
        profile_image_url,
        recipe_tutorial_video_url,
      },
    },
  } = body;

  const update = {
    data_block: { title, instruction, audio_instruction },
    media_block: {
      image_urls,
      video_urls,
      highlight_block: {
        banner_image_url,
        profile_image_url,
        recipe_tutorial_video_url,
      },
    },
  };
  const options = { new: true, multi: false };

  console.log(`Updating Step ${id}...`);

  try {
    const newDoc = await Step.findOneAndUpdate(id, update, options).exec();
    res.send(newDoc);
  } catch (err) {
    internalErr(next)(err)("failed to find one and update");
    return;
  }
};

export const deleteStep = async (req, res, next) => {
  const { Step } = getModels();

  const { id } = req.params;

  let deletedStep;
  try {
    deletedStep = await Step.findOneAndDelete({ id }).exec();
  } catch (err) {
    console.error(err);
    next(
      createError(
        500,
        "Error occurred while getting Step we want to delete: " +
          JSON.stringify(err)
      )
    );
    return;
  }

  if (!deletedStep) {
    next(createError(404, "Failed to find step you want to delete"));
    return;
  }

  let leftStep, rightStep;
  let prevStepID = deletedStep.prev_step_id;
  let nextStepID = deletedStep.next_step_id;

  if (prevStepID) {
    try {
      leftStep = await Step.findOne({ id: prevStepID }).exec();
    } catch (err) {
      internalErr(next)(err)(
        "Error occurred while looking up Step previous to deleted Step:"
      );
      return;
    }
  }

  if (nextStepID) {
    try {
      rightStep = await Step.findOne({ id: nextStepID }).exec();
    } catch (err) {
      internalErr(next)(err)(
        "Error occurred while looking up Step after deleted Step:"
      );
      return;
    }
  }

  if (leftStep) {
    try {
      leftStep.next_step_id = rightStep ? rightStep.id : "";
      await leftStep.save();
    } catch (err) {
      console.error(err);
      internalErr(next)(err)(
        "Error occurred while saving Step previous to deleted Step:"
      );
      return;
    }
  }

  if (rightStep) {
    try {
      rightStep.prev_step_id = leftStep ? leftStep.id : "";
      await rightStep.save();
    } catch (err) {
      console.error(err);
      internalErr(next)(err)(
        "Error occurred while saving Step after deleted Step:"
      );
      return;
    }
  }

  res.send(deletedStep);
};

const createErr = (code) => (next) => (err) => (msg) =>
  next(createError(code, msg + ": " + JSON.stringify(err)));

const internalErr = (next) => (err) => (msg) => createErr(500)(next)(err)(msg);

const notFoundErr = (next) => (err) => (msg) => createErr(404)(next)(err)(msg);

export const getStep = async (req, res, next) => {
  const { Step } = getModels();

  const { id } = req.params;

  try {
    const step = await Step.findOne({ id }).exec();
    if (!step) {
      notFoundErr(next)(err)("Step not found");
      return;
    }
    res.send(step);
  } catch (err) {
    console.error(err);
    internalErr(next)(err)("Error occurred while finding Step:");
    return;
  }
};

export const getStepData = async (req, res, next) => {
  const { Step } = getModels();

  const { id } = req.params;

  try {
    const step = await Step.findOne({ id }).exec();
    if (!step) {
      notFoundErr(next)(err)("Step not found");
      return;
    }
    res.send(step.data_block);
  } catch (err) {
    console.error(err);
    internalErr(next)(err)("Error occurred while finding Step:");
    return;
  }
};
