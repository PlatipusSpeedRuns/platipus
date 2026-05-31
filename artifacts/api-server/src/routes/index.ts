import { Router, type IRouter } from "express";
import healthRouter from "./health";
import streamRouter from "./stream";
import customAuthRouter from "./custom-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/stream", streamRouter);
router.use("/auth", customAuthRouter);

export default router;
