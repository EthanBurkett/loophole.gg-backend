import { Router } from "express";
import {
  getGuildController,
  getGuildPermissionsController,
  getGuildsController,
} from "../../../controllers/guilds";
import isAuthenticated from "../../../middlewares/isAuthenticated";
import roles from "./roles";
const router = Router();

router.get("/", isAuthenticated, getGuildsController);

router.get("/:id/permissions", isAuthenticated, getGuildPermissionsController);

router.get("/:id", getGuildController);

router.use("/roles", roles.Router);

export default router;
