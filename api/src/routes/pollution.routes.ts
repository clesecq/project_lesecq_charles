import { Application, Router } from "express";
import * as pollution from "../controllers/pollution.controllers.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

export default (app: Application): void => {
  const router = Router();

  // Public routes - Retrieve all/single pollutions
  router.get("/", pollution.findAll);
  router.get("/:id", pollution.findById);
  router.get("/:id/photo", pollution.getPhoto);

  // Protected routes - Create, Update, Delete (require authentication)
  router.post("/", authenticateJWT, pollution.create);
  router.put("/:id", authenticateJWT, pollution.update);
  router.delete("/:id", authenticateJWT, pollution.remove);
  router.post("/:id/photo", authenticateJWT, upload.single('photo'), pollution.uploadPhoto);

  app.use('/api/pollutions', router);
};
