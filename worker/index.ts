import { Hono } from "hono";
import { cache } from "hono/cache";
import { githubRoute } from "./github";
import { graphRoute } from "./graphs/index";
import { API_CACHE_MAX_AGE } from "./constants";

type Bindings = { IS_DEV?: string };

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", (c, next) => {
  if (c.env.IS_DEV) return next();
  return cache({
    cacheName: "contribution-graph",
    cacheControl: `public, max-age=${API_CACHE_MAX_AGE}`,
  })(c, next);
});

app.use("/graph/*", async (c, next) => {
  await next();
  if (c.env.IS_DEV) {
    c.res.headers.set("Cache-Control", "no-store");
  }
});
app.route("/api/github", githubRoute);
app.route("/graph", graphRoute);

export default app;
