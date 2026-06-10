import { Hono } from "hono";
import { cors } from "hono/cors";
import userRoute from "./routes/user.route";

const app = new Hono();
app.use("*", cors());

const routes = app
	.get("/", (c) => {
		return c.json({ health: "ok" });
	})
	.route("/visitor", userRoute);

export type AppType = typeof routes;
export default app;
