"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAuthenticated = (req, res, next) => req.user ? next() : res.status(403).send({ msg: "Unauthorized" });
exports.default = isAuthenticated;
