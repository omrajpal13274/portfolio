# omrajpal.in

Personal portfolio for **Om Rajpal**, AI Engineer. A horizontal-scroll site
where the whole page renders sideways, built with Next.js, GSAP and Sanity.

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs with **no configuration**. Content comes from `src/content/seed.ts`
until Sanity is connected, so the project builds and deploys out of the box.

---

## The design

Paper white against near-black panels, heavy grotesk set enormous and allowed
to crop at the panel edge, hand-drawn line art, and one hot red used **only** as
spray paint, always on top of the artwork and type, never beside them.

Six stations run left to right, traversed by ordinary vertical scroll:

```
00 INDEX → 01 THESIS → 02 WORK → 03 TRAJECTORY → 04 ACHIEVEMENTS → 05 SIGNAL
```

## Things worth a look

**The scroll.** A viewport-height wrapper is pinned while the track inside it
translates on X, scrubbed against vertical scroll at 1:1. 3600px of scroll
moves the track exactly 3600px sideways. This deliberately avoids the usual
`overflow: hidden` + wheel-hijack approach, so the scrollbar, keyboard paging,
find-in-page and screen readers all keep working. The page just renders
sideways.

**The catalogue.** Projects are a strip of narrow columns showing only their
name, set vertically. Hovering opens one and the rest recede. The columns share
a *fixed total width* and only redistribute it. Animating each column's own
width would change the track's `scrollWidth`, which the pinned ScrollTrigger
caches as its scroll distance, and the page length would shift under the reader
mid-scroll.

**The traverse.** Opening a project lifts a clone of its wordmark into a fixed
overlay, navigates, then flies it into the project page's title, un-rotating
and recolouring in flight, since it leaves a paper column as black type and
lands on an ink band as white.

**Illustrations that boil.** Line art is displaced by fractal noise whose seed
steps a few times a second. Traditional hand-drawn animation redraws every
frame, so the lines never sit still; this reproduces that from a single drawing,
which is why the artwork reads as rough loops without any GIFs being loaded.

**The loader.** A spray can fills with red as the page loads, tracking real
progress: it climbs to 92 on its own, then waits on `document.fonts.ready` and
window `load`, with a floor so it never flashes past and a ceiling so a slow
asset can't trap anyone.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | GSAP (ScrollTrigger, SplitText, DrawSVG) plus Lenis |
| CMS | Sanity v5 with an embedded Studio at `/studio` |
| Hosting | Vercel |

## Content management

```bash
npx sanity@5 login
npx sanity@5 init --env=.env.local   # --env takes the filename as a value
npm run dev
```

Pin the CLI to 5. The installed `sanity` package is 5.x, and re-running `init`
with a newer CLI rewrites `src/sanity/env.ts`, scaffolds a second `sanity/lib/`
directory, and changes the installed major underneath the Studio.

The admin panel is then live at `/studio`. A brand new dataset opens onto an
empty list, which is correct rather than broken: everything on the site still
comes from `src/content/seed.ts`, and publishing a document takes over its
collection. Projects, experience and awards are orderable lists, so **dragging
a card reorders it on the site**.

### What is editable

| Where | What |
|---|---|
| **Projects** | Title, slug, tagline, org, role, period, stack, status, restriction note, problem / built / outcome, links, award badge, illustration, fallback doodle |
| **Experience** | Org, role, location, dates, summary, current flag, ordered oldest first |
| **Awards** | Title, org, year, headline metric + label, detail, and a reference to the project it recognises |
| **Site settings** | Name, role, thesis, location, email, socials, résumé, currently at, headline stats, work standfirst, contact heading, footer note |

Structural labels such as "Trajectory", "Open project" and "The problem" are
deliberately *not* in the CMS. They are layout rather than content.

Content resolves per collection: Sanity when it has published documents, seed
content otherwise. A fresh, empty project therefore does not blank the site, and
a CMS outage cannot take it down.

### Publishing instantly

Pages revalidate hourly on their own, so an edit can take an hour to appear,
long enough that the natural reaction is to publish again, and again. Setting
`SANITY_REVALIDATE_SECRET` enables `/api/revalidate`, which Sanity calls on
publish so the change lands in about a second. Webhook settings are in
`src/app/api/revalidate/route.ts`. Without the secret the route returns 501 and
the hourly cycle is all you get; it refuses to run open, since otherwise anyone
could force cache rebuilds.

## Five things that will bite you if you edit this

**1. Use the `wide:` variant for layout, never `lg:`.**
Horizontal mode requires a wide viewport *and* permission to animate. As a
`lg:` / `motion-reduce:` pair those have equal specificity and are resolved by
Tailwind's output order, which silently left reduced-motion visitors with a
12,000px track inside an `overflow: hidden` frame and no way to reach five
sixths of the site. `wide:` is both conditions in one media query.

**2. Tailwind v4 transform utilities are invisible to GSAP.**
`-rotate-90` compiles to the independent CSS `rotate` property, not `transform`,
which reads as `none`. GSAP reads and writes `transform`, so it cannot see them.
GSAP Flip in particular diffs nothing, and a cloned element inherits the
utility and transforms twice.

**3. Every field from Sanity can be null, and one null takes the site down.**
`src/content/index.ts` normalises everything the CMS returns before it reaches a
component. Publishing a project with only a title made `project.stack.map(...)`
throw and served a 500 for the whole site. Add a schema field, add it to the
normaliser.

**4. A document `_id` containing a dot is invisible to the live site.**
Sanity reads a dot as a path prefix, the mechanism that keeps `drafts.*`
private, so a document called `project.pedigree` is hidden from unauthenticated
reads even on a public dataset. It shows in the Studio and not on the site,
which reads as "the CMS isn't wired up". Use dashes if you ever set ids by hand;
ids the Studio generates are fine.

Related: seed fallback is per collection, so the first document published into
an empty collection makes all of its seed entries disappear at once. Populate a
collection fully before relying on it.

**5. Don't derive scroll state from `getBoundingClientRect` inside `onUpdate`.**
With `scrub`, the transform trails the scroll position by up to a second, so the
live DOM reports a position the reader has already left, and once scrolling
stops no further updates fire and the value is stranded. Reveal animations use
an IntersectionObserver (`src/lib/useInView.ts`) instead, whose failure mode is
"visible and un-animated" rather than "invisible forever".

## Accessibility and motion

Reduced motion is a first-class path, not a fallback: the horizontal track
becomes an ordinary vertical document, the splash is skipped, hover-revealed
detail is shown outright, and every scroll-driven animation resolves to its end
state. The same layout serves mobile.

## Structure

```
src/
  app/
    (site)/            catalogue + project pages, share the transition overlay
    studio/            Sanity admin (outside (site): it needs its own scroll)
  components/
    HorizontalTrack    the pin + translate mechanic
    PageTransition     the catalogue → project wordmark traverse
    Doodle             hand-drawn line art, drafted in by DrawSVG
    Spray              red paint marks (swipe, underline, blob…)
    Intro              the splash; opens the intro gate on completion
    stations/          the six stations
  content/             types, seed content, Sanity-or-seed resolution + normaliser
  lib/                 gsap setup, useInView, introGate
  sanity/              client, GROQ queries, schemas
```

`sitemap.ts` and `robots.ts` sit at the app root; the sitemap is generated from
the CMS, so publishing a project lists it. `not-found.tsx` and `error.tsx` are
there too, deliberately outside `(site)`, since a URL that matched no route at all
cannot depend on anything that layout sets up.

### A local quirk

Turbopack's persistent cache does not survive on exFAT volumes: a second build
fails with `Failed to open database … invalid digit found in string`.
`rm -rf .next` before building clears it. Nothing to do with the code; it only
bites if the repo lives on an external drive.

## Deploying

Push to GitHub and import in Vercel. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` and
`NEXT_PUBLIC_SANITY_DATASET` (plus `SANITY_API_READ_TOKEN` if the dataset is
private), and add the deployment's domain to the CORS origins in
`sanity.io/manage`.

Project pages are statically generated and revalidate hourly, so publishing in
the Studio reaches the live site without a redeploy. Add
`SANITY_REVALIDATE_SECRET` and the webhook to make that instant instead.

The site is also worth deploying before Sanity exists: with no environment
variables at all it builds and serves the seed content.

## Licence

Code is MIT, see [LICENSE](LICENSE). The written content, the illustrations
and the personal details are © Om Rajpal and are not covered by it. Fork the
code; please replace `src/content/seed.ts` with your own.
