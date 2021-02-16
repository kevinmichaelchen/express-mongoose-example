import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import bodyParser from "body-parser";

import { initialize } from "./db";

initialize();

import indexRouter from "./routes/index";
import stepsRouter from "./routes/steps";

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger("dev"));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", indexRouter);
app.use("/steps", stepsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // JSON errors, courtesy of:
  // https://stackoverflow.com/questions/23296031/express-js-4-how-to-serve-json-results-without-rendering-any-views-css
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err,
  });
  return;
});

module.exports = app;
