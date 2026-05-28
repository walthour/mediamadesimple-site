# mediamadesimple-site

Static replica of the live Media Made Simple marketing site (mediamadesimple.co).
Built as a clean, self-hosted starting point so we own the source and can iterate.

## Stack
- Plain HTML5, CSS3, vanilla JS — no build step, no framework
- Google Fonts: Archivo (heading) + Space Grotesk (body)
- Deploys directly to Vercel as a static site

## Pages
| Path | File |
| --- | --- |
| `/` | `index.html` |
| `/contact` | `contact.html` |
| `/terms-and-conditions` | `terms-and-conditions.html` |
| `/privacy-policy` | `privacy-policy.html` |
| 404 | `404.html` |

## Local preview
```bash
cd active/websites/mediamadesimple
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (Vercel)
1. Push to GitHub repo `mediamadesimple-site`
2. Import the repo on Vercel — no build command, output directory is `.`
3. Default URL: `https://mediamadesimple-site.vercel.app`
4. When ready, point `mediamadesimple.co` DNS at Vercel

## Contact form
Currently a `mailto:hello@mediamadesimple.co` handoff. Swap for Formspree / Web3Forms / a serverless endpoint later if we want server-side capture.

## Sub-pages saved for future
`/ads` and `/marketing` from the live site were scraped but **not** rebuilt — both had unfinished copy / wrong-brand testimonials. Reference content lives in `_reference/` (git-ignored).
