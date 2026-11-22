# claradidonato.com

A plain HTML/CSS copy of Clara's Squarespace site, ready for GitHub Pages.
No build step, no framework: open a file, change the text, push.

```
index.html            Home
chisono/index.html    Chi sono   (www.claradidonato.com/chisono)
servizi/index.html    Servizi
contatti/index.html   Contatti   (contact form)
404.html              "Page not found"
assets/css/style.css  All styling (colours, fonts, spacing at the top)
assets/js/main.js     Mobile menu, before/after carousel, fade-ins, home photo zoom, servizi opening
assets/img/           Photos (filled in automatically, see step 3)
s/                    CV PDF   (filled in automatically, see step 3)
scripts/              Photo download list + script
.github/workflows/    Publishes the site on every push
```

## Going live

Do these **while the Squarespace site is still online** — the photos are copied from it.

1. **Push this folder to a new GitHub repo** (e.g. in Claude Code: "push this folder to a new GitHub repo called claradidonato.com").
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Go to the **Actions** tab and run **Deploy site** (or push any change). The first run downloads all photos
   and the CV from Squarespace, saves them into the repo, and publishes the site at
   `https://<your-username>.github.io/<repo-name>/`. Check that every page looks right there.
4. **Connect the domain** (GitHub recommends this order):
   1. Verify the domain: your GitHub profile → **Settings → Pages → Add a domain** → `claradidonato.com`, and add the TXT record it shows.
   2. Repo **Settings → Pages → Custom domain**: `www.claradidonato.com` → Save.
   3. Where the domain is managed (probably Squarespace → Domains → DNS settings), remove the old Squarespace records for `www` and `@`, then add:

      | Type  | Host | Value |
      |-------|------|-------|
      | CNAME | www  | `<your-username>.github.io` |
      | A     | @    | 185.199.108.153 |
      | A     | @    | 185.199.109.153 |
      | A     | @    | 185.199.110.153 |
      | A     | @    | 185.199.111.153 |

   4. Once GitHub shows the domain as working (can take up to a day), tick **Enforce HTTPS**.
5. Only when www.claradidonato.com shows the new site: cancel the Squarespace **website** plan.
   Keep the **domain** (or transfer it elsewhere first) — it's billed separately and the site needs it.

## Contact form

The form sends messages to `claradidonato.arch@gmail.com` through [FormSubmit](https://formsubmit.co) (free, no account).
The very first message sent from the live site triggers an **activation email to that Gmail** — Clara has to click
"Activate" once, then messages arrive normally. To use another address, change the `action="…"` line in `contatti/index.html`.

## Editing

- **Text**: edit the HTML file of the page. Each block has a comment saying what it is.
- **New job on Chi sono**: copy one `<article class="job">…</article>` block and change it.
- **New service**: copy one `<details>…</details>` block in `servizi/index.html`.
- **Before/after photos**: put the image in `assets/img/` and add a `<li><img …></li>` line in the carousel in `index.html`.
- **Header & footer** are repeated in the four pages — change all four.
- **Colours, spacing, fonts**: variables at the top of `assets/css/style.css`.
- **Fonts**: the titles use IBM Plex Mono (same as before). The body text used Adelle Sans, an Adobe font that came with Squarespace,
  so it's replaced by the free look-alike Fira Sans. Both are stored in `assets/fonts/` (no Google Fonts calls).

Preview locally: run `python3 -m http.server` in this folder and open http://localhost:8000.
