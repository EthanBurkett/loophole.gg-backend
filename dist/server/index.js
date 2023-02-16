"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const _config_1 = __importDefault(require("./!config"));
require("./strategies/discord");
const _global_1 = __importDefault(require("../!global"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_1 = __importDefault(require("passport"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [
        "https://loophole.gg",
        "https://www.loophole.gg",
        "http://localhost:3000",
    ],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: _config_1.default.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: new connect_mongo_1.default({ mongoUrl: _global_1.default.mongo }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/v2", routes_1.default);
app.listen(_config_1.default.port, () => {
    console.log(chalk_1.default.green(`Server listening on port ${_config_1.default.port}`));
});
