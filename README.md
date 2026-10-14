# SaifMohammed22.github.io

Source for my personal portfolio website — projects, experience, and blog posts on
Machine Learning, Deep Learning, and AI research.

Live site: https://saifmohammed22.github.io

Built with [Hugo](https://github.com/gohugoio/hugo).

## Structure

```
hugo.yaml                 # site config + about/social/interests/education
content/post/*.md         # blog posts (markdown)
data/experience.yaml      # experience entries (homepage section)
data/news.yaml            # news entries (homepage section)
data/projects.yaml        # project entries (homepage section)
layouts/                  # templates and partials
static/                   # images, CSS, JS, files (copied to build root)
```

Non-post content lives in `data/*.yaml` — one file per section, instead of one
markdown file per entry.

## Editing content

- **About / social / interests / education**: `hugo.yaml` → `params.author`
- **Experience**: `data/experience.yaml`
- **News**: `data/news.yaml`
- **Projects**: `data/projects.yaml`
- **Blog posts**: add a markdown file in `content/post/`

## Building

```bash
hugo --minify        # output written to docs/
hugo server          # local preview at http://localhost:1313
```

`docs/` is build output and is **git-ignored** — never edit or commit it.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and deploys it to GitHub Pages.

> Repository Settings → Pages → Build and deployment → Source must be set to
> **GitHub Actions** (not "Deploy from a branch").
