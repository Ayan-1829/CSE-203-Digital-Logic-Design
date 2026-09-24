# DEVLOG

A running log of changes made to this site. Each entry records the date/time
of the update, the prompt given to the AI assistant, and a summary of what
was actually changed. New entries are added to the top.

---

## 2026-09-21 22:07 UTC

**Prompt given to the AI:**

> some places shows null texts (specially in outputs). Why? it should be avoided.

**What was happening:**

The interactive K-map (`js/kmap.js`, used on the "Karnaugh maps" slides in
Topic 4, and reachable from the Boolean Algebra topic's "Try it on a K-map"
button) has a "Test the result with switches" section that shows the live
output as `F = <value>`. That value comes from evaluating the simplified
expression, wrapped in a `try/catch` that falls back to `null` if the
evaluation fails for a given input combination. That fallback `null` was
being concatenated straight into the displayed string, so instead of a
sensible fallback the page literally printed **`F = null`**. This is the
"output" you saw it in — the K-map's live-output readout.

**Fix:** `js/kmap.js` now shows `F = –` instead of `F = null` when the
value can't be computed, matching the `–` fallback already used elsewhere
on the site (e.g. the shift-register demo) for the same kind of situation.

No other "null"-as-visible-text spots were found in a full search of the
codebase (all other `null`-initialized variables in the JS are either
internal state, DOM references, or already guarded before being shown).

---

## 2026-09-21 21:55 UTC

**Prompt given to the AI:**

> For the real life examples, make the texts along with the interactive buttons a bit short-> then the implemented gate(make it smaller) then at right keep the output. All the texts should be smaller for this section (specially the states- pressed = 1 etc)

**Changes made:**

1. **Shrunk the whole "Try it: click the inputs" section** (real-life
   gate demos — AND, OR, NOT, NAND, NOR, XOR, XNOR — in `css/style.css`
   and `js/reallife.js`), keeping the existing left-to-right order
   (inputs → gate → output):
   - Toggle buttons: smaller, fixed 13px text (was `.95em`, which scaled
     up with the larger slide font), tighter padding, and a narrower
     column (135–180px instead of 170–230px).
   - State text (e.g. "pressed = 1", "closed = 1"): reduced from
     inheriting the button's font size down to 11.5px specifically —
     this was the text you called out as needing to be smaller.
   - The gate symbol: reduced its render scale from 1.7× to 1.15×, so it
     takes up noticeably less width in the middle of the row.
   - Output box on the right: smaller LED (26px, was 38px), smaller
     output name label (11.5px) and output state text (14px fixed, was
     `1.2em`), and tighter padding, so it matches the new, more compact
     scale of the rest of the row.

---

## 2026-09-21 21:50 UTC

**Prompt given to the AI:**

> for the demorgan's law. (A+B)' = A'.B', the gap between A'.B' is so small that it seems like (AB)' . use a . between them. The opening of topics take directly to the summary, but it should take to the first slide of the topic.

**Changes made:**

1. **Added a "·" between separately-complemented variables (Topic 3,
   `topics/03-boolean-algebra-and-gates.html`)**
   - Wherever two individually-overlined variables sat right next to each
     other (e.g. Ā next to B̄, meant to read as A′·B′), the two bars ran
     together and looked like one continuous bar over "AB" — i.e. it read
     as (AB)′ instead of A′·B′. Inserted a middle dot between every such
     adjacent pair (13 spots: the DeMorgan formula and its steps, the
     "extends to any number of variables" line, the minterm table, both
     DeMorgan-check tables, the circuit heading, and the summary). A
     single bar drawn over a whole group, like the one over "AB" that
     means (AB)′, is unaffected — that one is correct as one continuous
     bar with no dot.

2. **Opening a topic now always starts at slide 1 (`js/slides.js`)**
   - The deck was silently resuming whichever slide you'd last viewed in
     that topic (saved in the browser's local storage), so re-opening a
     topic you'd already finished dropped you back on the summary slide.
     Removed that "resume last position" behavior — opening a topic link
     with no `#s=` in the URL now always goes to slide 1. Direct links
     that specify a slide (like `#s=8` from the K-map demo, or `#s=last`
     when going back a topic) are unaffected.

---

## 2026-09-21 21:45 UTC

**Prompt given to the AI:**

> take the links to the bottom of the topics, the height of the image is so big. Keep the actual rectangular size of the og-image. Only give me the updated files and keep tracking the DEVLOG

**Changes made:**

1. **Moved the "More tools to explore" section** (`index.html`) from between
   the hero and the topics list down to the **bottom of the page**, after
   the 13-topic list (`<ul class="tlist">`).
2. **Fixed the tool-card image sizing** (`css/style.css`) — the images were
   being forced into a fixed 16:9 box (`aspect-ratio:16/9` + `object-fit:cover`),
   which cropped/stretched them and made the cards taller than the source
   images. Removed that and now the images size naturally
   (`width:100%; height:auto`), preserving the actual rectangular
   proportions of the Gate Forge and Inside the Computer OG images.

---

## 2026-09-21 21:41 UTC

**Prompt given to the AI:**

> IN Boolean Algebra & Logic Gates:
>
> 1. For the real life examples, can you make the buttons a lil bit short, take the symbol right after that and then the output? It will reduce the vertical space.
> 2. Increase the size of the text Law and Identities, Use more horizontal space for the comma separated laws.
> 3. Show the steps of the de-morgan law.
> 4. For the truth table summary take the not, buffur table to the left and reduce it's width, and in that reduced place can be given to the other gate containing table. For Demorgan's table, separate two laws and show all steps in the table (A, B, A+B, (A+B)', A', B', A'+B') highlight the final matched columns.
> 5. Linking to the k-map should direct take to the map area.
>
> Justify the left and right side of the pages.
> Increase the topics outline page's text size a bit more.
> Use bar(on top a line) to all the equations that having '
>
> (Follow-up message, same session): Along with the previous changes.
>
> Add more links at the homepage:
> Inside the Computer: https://ayan-1829.github.io/inside-the-computer/
> Gate-Forge: https://gate-forge.netlify.app
>
> use the og-image for those.

**Changes made:**

1. **Real-life examples (Topic 3, `topics/03-boolean-algebra-and-gates.html`, `js/reallife.js`, `css/style.css`)**
   - The input toggle buttons, the gate symbol, and the output/LED box are now
     laid out in one horizontal row (`.rl-row`) instead of stacked vertically,
     and the toggle buttons are shorter (reduced padding). This applies to
     every real-life gate demo (AND, OR, NOT, NAND, NOR, XOR, XNOR) since they
     all share the same `realLife()` component.

2. **"Laws and identities" table**
   - Split from a single comma-separated cell into three columns — *Law*,
     *Form*, *Dual form* — so each side of a law gets its own column instead
     of being crammed together.
   - Added a dedicated `table.lawtable` style with larger text (18px) and
     wider padding.

3. **DeMorgan's theorems — added step-by-step derivations**
   - Added two side-by-side step lists under the theorem statements, one for
     each law, showing: start with the negated expression → swap the
     operator → complement every literal → result.

4. **Truth-table summary slides reworked**
   - *Truth tables (1 of 2):* reordered the cards so **NOT/Buffer** (only 2
     data columns) comes first and is narrower (`tcard-narrow`, capped
     width), and the freed-up space goes to the **All two-input gates**
     table (`tcard-wide`), using a new `.tt1-grid` layout
     (`0.65fr / 1.5fr / 1.15fr`). Minterms/maxterms table is unchanged in
     size.
   - *Truth tables (2 of 2):* the single combined DeMorgan table was split
     into **two separate tables**, one per law, each now showing every
     intermediate step — A, B, A+B, (A+B)′, A′, B′, A′B′ for the first law,
     and A, B, AB, (AB)′, A′, B′, A′+B′ for the second — with the two
     matching columns in each table highlighted (`td.hl`) to show the law
     holds in every row.

5. **K-map link now deep-links to the demo**
   - "Try it on a K-map" (in the Boolean simplifier demo) used to open
     Topic 4's title slide. It now opens
     `topics/04-universal-gates-and-k-maps.html#s=8`, which is the exact
     slide with the interactive K-map.

6. **Site-wide: justified body text**
   - Added `text-align: justify` to paragraph and slide list text
     (`p`, `.slide p`, `.slide li`) across the whole site, so text lines up
     on both the left and right edges. Left as left-aligned for a few short
     UI blurbs (e.g. the new tool cards) where justifying a couple of short
     lines looks worse, not better.

7. **Topics-outline slide text size increased further**
   - `.outline-list` (the "Topics in this chapter" slide in every topic deck)
     bumped again, from `clamp(16px,1.5vw,21px)` to `clamp(18px,1.9vw,24px)`.

8. **Overline (bar) notation for complements — Topic 3**
   - Added a reusable `.ov` CSS class (`text-decoration: overline`) and
     used it to replace the prime mark (′) and apostrophe-style complement
     notation with a proper bar-on-top, e.g. A′ → A̅, (A+B)′ → bar over
     "A+B", throughout Topic 3's slide content: the laws table, DeMorgan's
     theorems and its steps, the DeMorgan circuit heading, both DeMorgan
     truth tables, the minterm/maxterm table and its slide text, all three
     worked examples, both practice slides, and the summary.
   - **Scope note:** this was applied to Topic 3 only, and only to plain
     slide content. It was **not** applied inside HTML attributes
     (`data-title`, `aria-label`) or the quiz's JSON data, because those
     can't contain HTML markup — they still show the prime mark (′).
     Extending the bar notation to the other 12 topics, or to the quiz and
     the interactive Boolean-simplifier/K-map demos (which generate their
     own text in JavaScript), would need more changes to the shared JS —
     happy to do that next if you'd like it everywhere.

9. **Homepage: added two companion-tool cards with OG images**
   - Added a "More tools to explore" section to `index.html` with an image
     card for each tool, using the OG images you provided (resized to
     800px wide and saved as `img/gate-forge-og.png` and
     `img/inside-the-computer-og.png`):
     - **Gate Forge** → `https://gate-forge.netlify.app`
     - **Inside the Computer** → `https://ayan-1829.github.io/inside-the-computer/`
   - Both open in a new tab. Added a new `.toolcards`/`.toolcard` component
     in `css/style.css` for the image + title + blurb + link layout.

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