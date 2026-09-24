# DEVLOG

A running log of changes made to this site. Each entry records the date/time
of the update, the prompt given to the AI assistant, and a summary of what
was actually changed. New entries are added to the top.

---

## 2026-09-21 10:20 UTC

**Prompt given to the AI:**

> I have made this website for the students. I need to modify this:
> Increase the size of the text for the slide structure. Add SEO enriched modifications.
>
> Organize the the topic sections in separate folder keeping index outside. When slides on the top right is opened, it don't have any cross button.
>
> Maintain A DEVLOG.md file for tracking the changes on each update. In that also include the promt given to the AI. Add date, time for each update.

**Changes made:**

1. **Increased slide text size** (`css/style.css`)
   - Base slide body text: `font-size:clamp(16px,1.35vw,21px)` → `clamp(18px,1.6vw,24px)`
   - Slide `h2` headings: `clamp(26px,3.2vw,42px)` → `clamp(28px,3.5vw,46px)`
   - Slide `.kicker` label: `14px` → `15px`
   - Slide tables (`table.tt`): `clamp(13px,1.15vw,17px)` → `clamp(14px,1.3vw,19px)`
   - Outline slide list: `clamp(15px,1.3vw,19px)` → `clamp(16px,1.5vw,21px)`
   - Title-slide lead paragraph: `clamp(18px,1.9vw,26px)` → `clamp(19px,2.1vw,28px)`
   - Keyboard-shortcut hint text: `14px` → `15px`
   - Slide-list ("Slides") panel links: `15px` → `16px`

2. **Fixed the missing close button on the "Slides" panel**
   - The top-right "Slides" button opened a slide-list overlay that had no
     visible way to close it (only the `Esc` key worked, which most users
     would not discover).
   - Added a `✕` close button inside the panel header, in all 13 topic
     files (`topics/*.html`).
   - Wired it up in `js/slides.js`: clicking the button closes the panel
     and returns focus to the "Slides" toggle button; clicking anywhere
     outside the open panel also closes it now.
   - Added supporting styles (`.menu-head`, `.menu-close`) in `css/style.css`.

3. **Reorganized topic files into their own folder**
   - Moved all 13 numbered topic files (`01-introduction.html` through
     `13-digital-systems.html`) into a new `topics/` subfolder.
   - `index.html`, `practice.html`, `reference.html`, `projects.html`,
     `css/`, and `js/` remain at the site root, as requested.
   - Updated every internal reference inside the moved files: stylesheet
     link (`css/style.css` → `../css/style.css`), script tags
     (`js/*.js` → `../js/*.js`), the "All topics" / home links
     (`index.html` → `../index.html`), and the `window.DLD_TOPIC`
     prev/next configuration (topic 13's `next` now points to
     `../index.html`).
   - Updated `index.html`'s topic links and `projects.html`'s two
     "Open topic 8 / 9" links to point into `topics/`.
   - Updated `README.txt` to describe the new folder layout.

4. **SEO-enriched every page**
   - Added `<meta name="description">`, `<meta name="keywords">`,
     `<meta name="author">`, `<link rel="canonical">`, Open Graph tags
     (`og:type`, `og:title`, `og:description`, `og:url`), and Twitter
     Card tags to `index.html`, `practice.html`, `reference.html`,
     `projects.html`, and all 13 topic pages.
   - Rewrote `<title>` tags to be more descriptive and keyword-rich
     (e.g. "Number Systems & Binary Codes – Topic 2 | Digital Logic
     Design Notes").
   - Added JSON-LD structured data: a `Course` schema on `index.html`
     and a `LearningResource` schema (with `isPartOf` linking back to
     the course) on each topic page.
   - Added `robots.txt` and `sitemap.xml` at the site root, listing all
     17 pages.
   - **Action needed from you:** `robots.txt` and `sitemap.xml` currently
     use a placeholder domain (`https://your-domain.example/`). Replace
     it with your real domain once the site is deployed, and update the
     `canonical`/`og:url` values if you deploy under a different path
     than the root.

