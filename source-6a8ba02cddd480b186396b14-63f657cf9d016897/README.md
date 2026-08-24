# NexalField

Main business website for **NexalField** — *Where digital connections grow*.

Static site: plain HTML, CSS and a single small JavaScript file. No build step, no
framework, no dependencies.

## Structure

```
netlify.toml                 Publish directory, security headers, cache headers
public/                      Everything that gets deployed
  index.html                 Single-page site (hero, services, demos, pricing, about, FAQ, contact)
  thank-you.html             No-JavaScript fallback destination for the enquiry form
  404.html                   Not-found page
  robots.txt                 Crawler rules
  sitemap.xml                Sitemap
  favicon.ico                Favicon
  assets/css/styles.css      Stylesheet
  assets/js/main.js          Mobile nav, footer year, enquiry form validation + AJAX submit
  assets/img/                Brand assets (official logo, favicons, Open Graph image)
```

Only `public/` is published, so nothing else in the repository is reachable over HTTP.

## Branding

`public/assets/img/nexalfield-logo-original.jpg` is the official supplied logo, unmodified.
`nexalfield-logo.png` is the same artwork with the surrounding white canvas removed and a
transparent background, for use in the header and footer. `nexalfield-mark.png`, the
favicons and the Open Graph image are all derived from that same artwork — the logo is
never recoloured, redrawn or stretched.

## Enquiry form

The contact form uses **Netlify Forms** (form name: `enquiry`). Submissions appear under
*Forms* in the Netlify UI. JavaScript intercepts the submit to show an inline success
state; without JavaScript the form posts natively and lands on `/thank-you`.

## Payments

Payment buttons link directly to hosted Stripe payment pages. There is no payment code,
no backend and no credentials in this repository.

## Local preview

```
netlify dev
```
