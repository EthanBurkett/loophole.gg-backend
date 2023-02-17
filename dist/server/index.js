"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const chalk_1 = __importDefault(require("chalk"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const _config_1 = __importDefault(require("./!config"));
require("./strategies/discord");
const _global_1 = __importStar(require("../!global"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_1 = __importDefault(require("passport"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [
        "https://loophole.gg",
        "https://www.loophole.gg",
        "http://localhost:3000",
        "https://discord.com",
    ],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: _config_1.default.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: false,
        domain: _global_1.Production ? "loophole.gg" : "localhost",
        httpOnly: true,
        secure: _global_1.Production,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: new connect_mongo_1.default({ mongoUrl: _global_1.default.mongo }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(_global_1.Production ? "/" : "/v2", routes_1.default);
if (_global_1.Production) {
    const sslServer = https_1.default.createServer({
        key: fs_1.default.readFileSync(path_1.default.join("/etc/letsencrypt/live/api.loophole.gg", "privkey.pem")),
        cert: fs_1.default.readFileSync(path_1.default.join("/etc/letsencrypt/live/api.loophole.gg", "cert.pem")),
        ca: fs_1.default.readFileSync(path_1.default.join("/etc/letsencrypt/live/api.loophole.gg", "chain.pem")),
    }, app);
    sslServer.listen(443, () => {
        console.log(chalk_1.default.green("API is listening on port 443"));
    });
}
else {
    app.listen(_config_1.default.port, () => {
        console.log(chalk_1.default.green(`API is listening on port ${_config_1.default.port}`));
    });
}
