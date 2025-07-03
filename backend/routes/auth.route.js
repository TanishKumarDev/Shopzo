import express from "express";
import sign from "jsonwebtoken";
import { signup, login, logout } from "../controllers/auth.controller.js";

const routes = express.Router();

routes.get("/signup", signup);

routes.get("/login", login);

routes.get("/logout", logout);

export default routes;