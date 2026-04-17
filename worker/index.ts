import { Hono } from "hono";
import { cache } from "hono/cache";
import { githubRoute } from "./github";
import { graphRoute } from "./graphs/index";

const app = new Hono();

app.get("/api/*", cache({ cacheName: "contribution-graph", cacheControl: "public, max-age=300" }));
app.route("/api/github", githubRoute);
app.route("/graph", graphRoute);

export default app;
