import express from "express";
import { getAllSteps, getStep, createStep, deleteStep } from "./service";

const router = express.Router();

// GET /steps
router.get("/", getAllSteps);

// GET /steps/1
router.get("/:id", getStep);

// POST /steps
router.post("/", createStep);

// DELETE /steps/1
router.delete("/:id", deleteStep);

export default router;
