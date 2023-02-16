"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const _global_1 = __importDefault(require("./!global"));
(async () => {
    mongoose_1.default.set("strictQuery", true);
    await mongoose_1.default
        .connect(_global_1.default.mongo)
        .then(() => {
        console.log("Connected to MongoDB");
    })
        .catch((err) => {
        console.log(err);
    });
})();
require("./bot");
require("./server");
