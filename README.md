<div align="center">

# Contribution Graph

[![license](https://img.shields.io/github/license/ren510dev/contribution-graph.svg)](https://github.com/ren510dev/contribution-graph/blob/main/LICENSE)
[![Deploy to Cloudflare Workers](https://github.com/ren510dev/contribution-graph/actions/workflows/deploy.yml/badge.svg)](https://github.com/ren510dev/contribution-graph/actions/workflows/deploy.yml)

Visualize any GitHub user's contribution activity as embeddable SVG badges.
**No token required. Just a URL.**

**→ Try it at [contribution-graph.ren510.dev](https://contribution-graph.ren510.dev)**

![Contribution Graph](https://contribution-graph.ren510.dev/graph/ren510dev/calendar.svg?theme=bordeaux)

</div>

---

## Quick Start

Paste this into any GitHub README or website:

```markdown
![Contribution Graph](https://contribution-graph.ren510.dev/graph/YOUR_USERNAME/calendar.svg?theme=github)
```

That's it.

---

## Graph Types

| Type            | Preview                                             |
| --------------- | --------------------------------------------------- |
| `calendar`      | GitHub-style contribution heatmap                   |
| `activity-line` | Line chart of daily contributions (last 31 days)    |
| `stats-bar`     | Contribution insights with day-of-week breakdown    |
| `compact-bar`   | Compact weekly bar chart                            |
| `streak`        | Current streak, longest streak, total contributions |
| `heatmap-ring`  | Circular heatmap ring by week                       |
| `languages`     | Top languages by repository                         |
| `profile-card`  | Profile overview with stats and top languages       |

## Themes

|                                                                                              |                                                                                                |                                                                                            |                                                                                                    |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| ![bordeaux](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=bordeaux) | ![github](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=github)       | ![dracula](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=dracula) | ![tokyo-night](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=tokyo-night) |
| `bordeaux`                                                                                   | `github`                                                                                       | `dracula`                                                                                  | `tokyo-night`                                                                                      |
| ![nord](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=nord)         | ![rose-pine](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=rose-pine) | ![ocean](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=ocean)     | ![sunset](https://contribution-graph.ren510.dev/graph/ren510dev/streak.svg?theme=sunset)           |
| `nord`                                                                                       | `rose-pine`                                                                                    | `ocean`                                                                                    | `sunset`                                                                                           |

> Light variants available: `github-light`, `bordeaux-light`, `dracula-light`, `nord-light`, `ocean-light`

---

## URL Parameters

```
https://contribution-graph.ren510.dev/graph/:username/:type.svg
```

| Parameter  | Required | Description                          |
| ---------- | :------: | ------------------------------------ |
| `username` |    ✅    | GitHub username                      |
| `type`     |    ✅    | Graph type (see above)               |
| `theme`    |          | Theme name (default: `bordeaux`)     |
| `year`     |          | 4-digit year (default: current year) |

---

## Architecture

```mermaid
graph LR
    subgraph Browser["User (Browser)"]
        React["React + TypeScript<br/>Built by Vite"]
    end

    subgraph CF["Cloudflare Workers"]
        Hono["Hono + TypeScript<br/>API / SVG generation"]
    end

    subgraph GH["GitHub"]
        GHHTML["github.com<br/>contributions HTML"]
        GHAPI["api.github.com<br/>REST API"]
    end

    React -->|"fetch (JSON / SVG)"| Hono
    Hono -->|"scraping"| GHHTML
    Hono -->|"REST API"| GHAPI
    Hono -->|"JSON / SVG response"| React
```

## Tech Stack

- React 19 + TypeScript
- Hono (Cloudflare Workers)
- Tailwind CSS 4
- Vite

## License

- [MIT License - ren510dev/contribution-graph]

[mit license - ren510dev/contribution-graph]: https://github.com/ren510dev/contribution-graph/blob/main/LICENSE
