import { Router } from "express";
import {
  registerUser,
  loginUser,
  loginUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/authenticate.middleware.js";


const router = Router();

//We will use the Multer middleware just before sending the request to the function
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyjwt, logoutUser);

export default router;
