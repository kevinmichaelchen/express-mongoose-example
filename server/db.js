import mongoose from "mongoose";
import paginationPlugin from "mongoose-cursor-pagination";
import {
  defaultPageSize,
  maxPageSize,
  minPageSize,
} from "./routes/query-params";

let db;
const Models = {};

export const getDB = () => db;
export const getModels = () => Models;
export const initialize = () => {
  initializeSchemas();
  initializeConnection();
};

const initializeConnection = () => {
  // Connect to database
  console.log("connecting to mongodb...");
  mongoose.connect("mongodb://localhost/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("successfully connected to mongodb.");
  });
};

const initializeSchemas = () => {
  // Define schema
  const stepSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    next_step_id: String,
    prev_step_id: String,
    data_block: {
      number: Number,
      title: String,
      instruction: String,
      audio_instruction: String,
    },
    media_block: {
      image_urls: [{ url: String }],
      video_urls: [{ url: String }],
      highlight_block: {
        banner_image_url: String,
        profile_image_url: String,
        recipe_tutorial_video_url: String,
      },
    },
  });

  stepSchema.plugin(paginationPlugin, {
    key: "id",
    limit: defaultPageSize,
    maxLimit: maxPageSize,
    minLimit: minPageSize,
  });

  // NOTE: methods must be added to the schema before compiling it with mongoose.model()
  stepSchema.methods.toString = function () {
    return `Step ${this.id}`;
  };

  // Compile schema into model
  const Step = mongoose.model("Step", stepSchema);

  Models.Step = Step;
};
