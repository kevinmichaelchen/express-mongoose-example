import express from "express";
import {
  getAllSteps,
  getStep,
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

// PUT /steps/1
router.put("/:id", updateStep);

// POST /steps
router.post("/", createStep);

// DELETE /steps/1
router.delete("/:id", deleteStep);

// DELETE /steps
router.delete("/", deleteAllSteps);

export default router;
