import { ulid } from "ulid";
import createError from "http-errors";
import { getModels } from "../db";
import { getPaginationParams } from "./query-params";
import mongoose from "mongoose";

export const getAllSteps = (req, res, next) => {
  const { Step } = getModels();

  // Get URL parameters related to pagination
  const { query } = req;

  const paginationParams = getPaginationParams(query);

  console.log(paginationParams);

  const { forward, cursor, limit, err } = paginationParams;

  if (err) {
    console.log("Failed to get Steps", err);
    next(createError(400, err));
    return;
  }

  let paginationOpts = {
    sort: { id: 1 },
    limit,
    select: ["id", "title"],
  };

  if (forward) {
    console.log("going forward");
    paginationOpts = { ...paginationOpts, startingAfter: cursor };
  } else {
    console.log("going backward");
    paginationOpts = { ...paginationOpts, endingBefore: cursor };
  }
  console.log(paginationOpts);

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

export const appendStep = (req, res, next) => {
  const { Step } = getModels();

  const { body } = req;
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
};

export const createStep = (req, res, next) => {
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
  if (!after) {
    next(createError(500, "Must provide 'after' url param"));
    return;
  }

  // Look up the Step that we're inserting after
  Step.findOne({ id: after }, (err, previousStep) => {
    if (!previousStep) {
      next(createError(404, "Previous Step not found"));
      return;
    } else if (err) {
      console.log("error", err);
      next(createError(500, "Error occurred while retrieving previous Step"));
      return;
    }

    // Get previous step's number!
    const prevNumber = previousStep.data_block.number;
    const nextStepID = previousStep.next_step_id;

    const newStepBody = {
      id: ulid(),
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
    previousStep.save((err, step) => {
      if (err) {
        console.log("Failed to create Step", err);
        next(createError(500, "Error occurred while saving previous Step"));
        return;
      }
      console.log("Successfully saved:", step.toString());
    });

    // Create new object
    const newStep = new Step(newStepBody);
    console.log("Saving", newStep.toString());

    // Save new object to database
    newStep.save((err, step) => {
      if (err) {
        console.log("Failed to create Step", err);
        next(createError(500, "Error occurred while saving Step"));
        return;
      }
      console.log("Successfully saved:", step.toString());
    });

    // Look up the Step that we're inserting after
    Step.findOne({ id: nextStepID }, (err, nextStep) => {
      if (!nextStep) {
        next(createError(404, "Next Step not found"));
        return;
      } else if (err) {
        console.log("error", err);
        next(createError(500, "Error occurred while retrieving previous Step"));
        return;
      }

      // TODO update its number and prev_step_id
    });

    // TODO for all subsequent Steps, increment the number field
    // TODO will need a transaction here to ensure atomicity for all updates
    // This is where using an array in a parent document would reduce the # of DB trips

    res.send(newStepBody);
  });
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
