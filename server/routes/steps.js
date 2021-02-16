import express from "express";
import {
  getAllSteps,
  getStep,
  getStepData,
  appendStep,
  createStep,
  updateStep,
  deleteStep,
  deleteAllSteps,
} from "./service";

const router = express.Router();

// GET /steps
router.get("/", getAllSteps);

// GET /steps/1
router.get("/:id", getStep);

// GET /steps/1/data
router.get("/:id/data", getStepData);

// PUT /steps/1
router.put("/:id", updateStep);

// POST /steps
router.post("/", createStep);

// POST /steps/add
router.post("/add", appendStep);

// DELETE /steps/1
router.delete("/:id", deleteStep);

// DELETE /steps
router.delete("/", deleteAllSteps);

export default router;
