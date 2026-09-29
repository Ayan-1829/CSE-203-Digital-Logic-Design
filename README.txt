DIGITAL LOGIC DESIGN: SLIDE SITE
================================

Open index.html in any modern browser. No server, build step or internet connection is needed
(the Google Fonts link is optional; the pages fall back to system fonts when offline).

Folder layout
-------------
index.html                     list of topics (kept at the site root)
topics/01-introduction.html …  one HTML file per topic (13 topics), each made of <section class="slide"> elements
practice.html                  drills, all practice problems, link to Gate Forge
reference.html                 searchable formulas and tables
projects.html                  project checklists, 3x3 multiplier, viva questions
css/style.css                  all styling (colour, font and font-size tokens are at the top of the file)
img/                            logo (logo.svg, logo-mark.svg), favicons, and the homepage tool-card images
js/core.js                     helpers, Boolean parser, Quine-McCluskey minimiser, gate shapes
js/lab.js                      small circuit simulator used by the "circuit" slides
js/kmap.js                     K-map component
js/demos.js                    the interactive demos for each topic
js/reallife.js                 real-life gate examples and the series/parallel switch analogy
js/quiz.js                     quiz widget
js/slides.js                   slide engine: keys, swipe, slide list, progress, full screen
js/extras.js                   drills, quick reference and project helpers
js/analytics.js                shared cookieless analytics tracker (do not edit; same file in every project)
js/course-events.js            course events for the Course analytics Sheet: slide titles, quizzes, tools, answers
robots.txt, sitemap.xml        SEO crawling files for https://ayan-1829.github.io/CSE-203-Digital-Logic-Design/
site.webmanifest, 404.html     web-app manifest and GitHub Pages "not found" page
img/og/                        1200x630 social-share image for every page
DEVLOG.md                      running log of changes made to this site, with the prompt used for each update

Files inside topics/ reference the shared css/ and js/ folders and index.html
one level up (e.g. "../css/style.css", "../index.html"), since they live in
their own subfolder. Topic-to-topic links (e.g. topic 1 -> topic 2) stay as
plain filenames because both files are siblings inside topics/.

Using the slides
----------------
Arrow keys / Page Up / Page Down / Space   move between slides
Home / End                                 first / last slide
F                                          full screen (falls back to presentation mode where the browser has no full-screen API)
M                                          slide list (each topic slide is listed by title)
Esc                                        close the slide list
Touch: swipe left or right on empty parts of a slide.
The address bar shows #s=N for slide N, so you can link straight to a slide.

Fonts and text sizes
--------------------
Four fonts, one job each: Bricolage Grotesque (headings), Literata (reading text),
Atkinson Hyperlegible Next (buttons, labels, tables, diagram labels), IBM Plex Mono (bits, code, equations).
Use only the five size tokens: var(--fs-sm) (smallest allowed), --fs-base, --fs-md, --fs-lg, --fs-xl.
On slides they scale with screen width so the back row can read them (--fs-sm is about 22px at 1280 wide).
In SVG diagrams give labels class="lt" (12.5 units) and size the <svg> with
style="width:100%;max-width:calc(<viewBox width> * var(--u))" so a 12.5-unit label matches --fs-sm.

Adding or editing a slide
-------------------------
Inside a topic file, a slide is just:

  <section class="slide" data-title="Name shown in the slide list" aria-label="Name shown in the slide list" tabindex="-1">
    <div class="slide-inner">
      <h2>Heading</h2>
      <p>Text...</p>
    </div>
  </section>

Copy an existing <section>, edit the text and save. The slide counter and the slide list update automatically.

Placeholders that become interactive
------------------------------------
<div data-demo="3" data-part="0"></div>      demo number 3 (topic number), panel 0 (see js/demos.js, DEMOS[3])
<div data-circuit="half-adder"></div>        a clickable example circuit (names are in PRESETS in js/lab.js)
<div data-reallife="AND"></div>              real-life gate slide (texts are in REAL_LIFE in js/reallife.js)
<div data-switch-analogy></div>              series/parallel switch drawing
<div data-gates></div>                       row of gate symbols
<div class="quiz-host" data-quiz-key="3"></div> + <script type="application/json" class="quiz-json">[...]</script>
