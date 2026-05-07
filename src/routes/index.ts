import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(settingsRouter);
router.use(healthRouter);

export default router;
