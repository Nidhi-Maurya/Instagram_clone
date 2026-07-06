import express from 'express';
import upload from '../middlewares/multer.js';
import isAuthenticated from "../middlewares/isAuthenticated.js";

import { login,register,logout, getProfile, editProfile, getSuggestedUser,followOrUnfollow } from "../controllers/user.controller.js"

const router = express.Router();


router.route('/register').post(register);
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/:id/profile').get(isAuthenticated,   getProfile)
router.route('/profile/edit').post(
  isAuthenticated,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  editProfile
);
router.route("/suggested").get(isAuthenticated,getSuggestedUser);
router.route('/followunfollow/:id').post(isAuthenticated,followOrUnfollow);


export default router;
