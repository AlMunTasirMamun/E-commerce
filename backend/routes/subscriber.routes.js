import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  toggleSubscriberStatus,
} from "../controller/subscriber.controller.js";

const subscriberRouter = express.Router();

// Public routes
subscriberRouter.post("/subscribe", subscribe);
subscriberRouter.post("/unsubscribe", unsubscribe);

// Admin routes (protected)
subscriberRouter.get("/all", authSeller, getAllSubscribers);
subscriberRouter.delete("/:id", authSeller, deleteSubscriber);
subscriberRouter.put("/toggle/:id", authSeller, toggleSubscriberStatus);

export default subscriberRouter;
