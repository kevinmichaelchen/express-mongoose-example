import mongoose from "mongoose";

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
    id: String,
    title: String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
  });

  // NOTE: methods must be added to the schema before compiling it with mongoose.model()
  stepSchema.methods.toString = function () {
    return `Step ${this.id}`;
  };

  // Compile schema into model
  const Step = mongoose.model("Step", stepSchema);

  Models.Step = Step;
};
