import express, { Router } from "express";
import { authorize } from "../controller/authorize";

const router: Router = express.Router();

// Define the routes and methods available for each route
router.route("/").get(authorize);

export default router;
