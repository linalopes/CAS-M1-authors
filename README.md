# Authors Rap Battle

An interactive "rap battle" between 74 authors who shaped the genealogy of AI and Machine
Learning — Symbolic AI, Connectionist AI, and Enactive AI — compiled from the references
covered during Module 1 of the **Certificate for Advanced Studies in AI for Creative
Practices** (ZHdK, Zurich University of Art and Design), taught by Professor Chris Salter,
August 2024.

Pick two authors and get an AI-generated rap battle between them, or explore all 74 authors
on an interactive bubble chart plotting era, region, gender, and years of active research.
The full course paper is linked from the page as a PDF.

By [Lina Lopes](https://www.linalopes.info/).

## How it works

- **Data source**: a single Google Sheet (published as CSV) holds each author's notable
  work, key contribution, mini bio, and metadata used by both the chart and the battle UI.
  [`data.js`](data.js) fetches and parses it once with `d3.csv`, and both consumers share
  that one request.
- **Author selection**: [`index.html`](index.html) + [`RapBattle.js`](RapBattle.js) — two
  searchable author fields (native `<input list>` + `<datalist>`, no extra JS dependency),
  each showing a bio on selection.
- **Rap battle**: clicking "Start Rap Battle" builds a prompt from the two selected authors'
  notable work and posts it to [`api/openai.js`](api/openai.js), a Vercel serverless
  function that proxies the OpenAI Chat Completions API. The function validates the prompt
  (type/length) and rate-limits requests per IP.
- **Bubble chart**: [`DataViz.js`](DataViz.js) renders all 74 authors with D3 — timeline on
  the x-axis, region on the y-axis, circle size mapped to years of research. On narrow
  screens the chart keeps its full layout and scrolls horizontally instead of squeezing.
- **Design**: colors, type, spacing, and the numbered section-header pattern follow the
  [SchoolAI Brand Kit](https://linalopes.github.io/SchoolAI-brand-kit/).

## Project structure

```
index.html          Page markup and structure
styles.css           Brand kit tokens + component styles
data.js               Shared CSV fetch/parse for the authors dataset
DataViz.js            Bubble chart (D3)
RapBattle.js           Author search, bios, and battle flow
api/openai.js            Vercel serverless function proxying OpenAI
essay/                    Final course paper (PDF)
python scripts/            One-off scripts used to prep the source spreadsheet (not run by the site)
```

## Running locally

This is a static site with no build step — serve the folder with anything that speaks HTTP:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The author search, bios, and bubble chart all work this
way. The `/api/openai` rap-battle endpoint is a Vercel serverless function, so it only runs
under `vercel dev` (or the deployed site) with an `OPENAI_API_KEY` environment variable set.
