import mongoose from "mongoose";
import global from "./!global";

(async () => {
  mongoose.set("strictQuery", true);
  await mongoose
    .connect(global.mongo)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
})();

import "./bot";
import "./server";
