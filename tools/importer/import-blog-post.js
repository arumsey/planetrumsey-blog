/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - posts are default content; the homepage pulls in recent posts
import recentPostsParser from './parsers/recent-posts.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/planetrumsey-cleanup.js';
import sectionsTransformer from './transformers/planetrumsey-sections.js';
import imageFixesTransformer from './transformers/planetrumsey-image-fixes.js';

// PARSER REGISTRY
const parsers = {
  'recent-posts': recentPostsParser,
};

const SITE_ORIGIN = 'https://blog.planetrumsey.ca';
const SITE_TITLE = 'planetrumsey';
const SIDEBAR_PATH = '/fragments/sidebar';
// social profiles left out of the migrated sidebar
const EXCLUDED_SOCIAL_HOSTS = ['twitter.com', 'x.com'];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "blog-post",
  "description": "Single-column blog post card with title, date, body text and photos, post footer and pager, beside a right sidebar with search, archive and labels over a full-bleed background image",
  "urls": [
    "https://blog.planetrumsey.ca/",
    "https://blog.planetrumsey.ca/2019/06/forty-one-days.html",
    "https://blog.planetrumsey.ca/2019/06/happy-canada-day.html",
    "https://blog.planetrumsey.ca/2019/07/land-down-under.html",
    "https://blog.planetrumsey.ca/2019/07/life-at-cottage.html",
    "https://blog.planetrumsey.ca/2019/07/my-2019-sabbatical-day-2.html",
    "https://blog.planetrumsey.ca/2019/07/one-week-to-go.html",
    "https://blog.planetrumsey.ca/2019/07/vacation-planning-101.html",
    "https://blog.planetrumsey.ca/2019/08/british-invasion-day-1-back-to-homeland.html",
    "https://blog.planetrumsey.ca/2019/08/british-invasion-day-2-bromsgrove.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-0.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-1.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-10-nicoya.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-11-monteverde.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-12-hanging.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-13-hiking-and.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-14-san-jose.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-15-hello.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-2-waterfalls.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-3-ziplines-and.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-4-more.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-5-beach-bound.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-6-samara_12.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-7-beach-trio.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-8-dolphins-and.html",
    "https://blog.planetrumsey.ca/2019/08/costa-rica-adventure-day-9-playa.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-11-woodhouse-eaves.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-12-bletchley.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-3-croeso-i-cymru.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-4-welsh-countryside.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-5-great-orme.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-7-snowdonia.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-8-birthplace-tour.html",
    "https://blog.planetrumsey.ca/2019/09/british-invasion-day-9-derbyshire-family.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-1-ferries-fish.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-2-hiking-hiking.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-3-mystic-beach.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-4-on-road-to.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-5-sea-to-sky.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-6-back-to-city.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-7-canyons-and.html",
    "https://blog.planetrumsey.ca/2021/10/west-coast-travels-day-8-city-tour.html",
    "https://blog.planetrumsey.ca/2023/04/nashville-with-two-teenagers.html",
    "https://blog.planetrumsey.ca/2023/06/get-ready-to-travel-with-me.html",
    "https://blog.planetrumsey.ca/2025/05/countdown-to-costs-rica.html",
    "https://blog.planetrumsey.ca/2025/08/working-remotely-from-costa-rica.html",
    "https://blog.planetrumsey.ca/2026/06/exploring-canada-countdown-to.html",
    "https://blog.planetrumsey.ca/2026/07/icebergs-puffins-and-views-our-9-days.html"
  ],
  "blocks": [
    {
      "name": "recent-posts",
      "instances": [],
      "pageInstances": {
        "https://blog.planetrumsey.ca/": [
          "body > div.content > div.content-outer > div.fauxborder-left.content-fauxborder-left > div.content-inner > div.main-outer"
        ]
      }
    }
  ],
  "sections": [
    {
      "id": "post",
      "name": "Blog post",
      "selector": [
        "#Blog1 .blog-posts",
        ".column-center-inner .blog-posts"
      ],
      "style": null,
      "blocks": [
        "recent-posts"
      ],
      "defaultContent": [
        ".date-header",
        ".post-title",
        ".post-body"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer only matters with 2+ sections
const transformers = [
  imageFixesTransformer,
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find the blocks on this page from the embedded template (pageInstances first, then instances).
 */
function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try {
      const { origin, pathname } = new URL(u);
      return `${origin}${pathname.replace(/\/$/, '')}`;
    } catch {
      return u;
    }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => claim(blockDef, selector));
  });
  return pageBlocks;
}

/**
 * Rewrite a source-site URL to a site-relative path without .html.
 * Returns null for external links.
 */
function toSitePath(href) {
  if (!href) return null;
  let u;
  try {
    u = new URL(href, SITE_ORIGIN);
  } catch {
    return null;
  }
  if (u.hostname !== new URL(SITE_ORIGIN).hostname) return null;
  let path = u.pathname.replace(/\.html?$/, '');
  if (path !== '/') path = path.replace(/\/$/, '');
  return `${path}${u.search}${u.hash}`;
}

function rewriteInternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const path = toSitePath(a.getAttribute('href'));
    if (path) a.setAttribute('href', path);
  });
}

/**
 * Read post metadata from the post footer and head before cleanup removes the footer.
 */
function extractMetadata(document) {
  const posts = document.querySelectorAll('.post.hentry');
  const isPost = posts.length === 1;
  const first = posts[0];
  const meta = {};

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const postTitle = first?.querySelector('.post-title')?.textContent.trim();
  meta.Title = isPost
    ? (postTitle || ogTitle?.content || document.title)
    : SITE_TITLE;

  const bodyText = first?.querySelector('.post-body')?.textContent.replace(/\s+/g, ' ').trim() || '';
  const ogDescription = document.querySelector('meta[property="og:description"]')?.content;
  const description = (isPost ? (bodyText || ogDescription) : 'travel ~ explore ~ repeat') || '';
  if (description) {
    meta.Description = description.length > 160 ? `${description.slice(0, 157).trim()}...` : description;
  }

  const ogImage = document.querySelector('meta[property="og:image"]')?.content;
  const firstImg = first?.querySelector('.post-body img')?.getAttribute('src');
  // dead Google Drive preview links (drive-viewer) fall back to the first post photo
  const imageSrc = (ogImage && !/\/drive-viewer\//.test(ogImage)) ? ogImage : firstImg;
  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    meta.Image = img;
  }

  if (isPost) {
    const published = first.querySelector('.post-timestamp abbr.published, .post-timestamp [itemprop="datePublished"]');
    const iso = published?.getAttribute('title');
    if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
      meta['Publication Date'] = iso.slice(0, 10);
    } else {
      const dateText = document.querySelector('.date-header')?.textContent.trim();
      const parsed = dateText ? new Date(dateText) : null;
      if (parsed && !Number.isNaN(parsed.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        meta['Publication Date'] = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
      }
    }

    const tags = [...first.querySelectorAll('.post-labels a')]
      .map((a) => a.textContent.trim())
      .filter(Boolean);
    if (tags.length) meta.Tags = tags.join(', ');

    const location = first.querySelector('.post-location')?.textContent
      .replace(/\s+/g, ' ')
      .replace(/^\s*Location:\s*/i, '')
      .trim();
    if (location) meta.Location = location;
  }

  return meta;
}

/**
 * Build the shared sidebar document (social links, archive, labels) from the right column.
 * The Blogger search widget is dropped: it posts to Blogger's search, which does not migrate.
 */
function buildSidebarFragment(document) {
  const sidebar = document.querySelector('.column-right-outer #sidebar-right-1');
  if (!sidebar) return null;

  const root = document.createElement('div');

  const social = sidebar.querySelector('#HTML2 .widget-content');
  if (social) {
    const ul = document.createElement('ul');
    social.querySelectorAll('a[href]').forEach((a) => {
      const host = (() => { try { return new URL(a.href).hostname.replace(/^www\./, ''); } catch { return ''; } })();
      if (EXCLUDED_SOCIAL_HOSTS.includes(host)) return;
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const img = a.querySelector('img');
      if (img) {
        const icon = document.createElement('img');
        icon.src = img.getAttribute('src');
        const host = (() => { try { return new URL(link.href).hostname.replace(/^www\./, ''); } catch { return ''; } })();
        icon.alt = host.split('.')[0] || 'social';
        link.append(icon);
      } else {
        link.textContent = a.textContent.trim();
      }
      li.append(link);
      ul.append(li);
    });
    if (ul.children.length) root.append(ul);
  }

  // Blogger's archive and label lists were generated pages; the migrated sidebar builds them
  // from the query index with an Archive Links block (type months / labels), so counts stay current.
  const addArchiveLinks = (widgetSelector, type) => {
    const widget = sidebar.querySelector(widgetSelector);
    if (!widget) return;
    const heading = widget.querySelector('h2');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      root.append(h2);
    }
    root.append(WebImporter.Blocks.createBlock(document, {
      name: 'Archive Links',
      cells: [['type', type]],
    }));
  };

  addArchiveLinks('#BlogArchive1', 'months');
  addArchiveLinks('#Label1', 'labels');

  if (!root.children.length) return null;
  rewriteInternalLinks(root);
  return root;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    // Content split into its own document: { element, path }.
    params.fragments = [];

    // 1. Initial cleanup (sidebar and post footer are kept until afterTransform)
    executeTransformers('beforeTransform', main, payload);

    // 2. Read what cleanup removes later: post metadata and the shared sidebar
    const meta = extractMetadata(document);
    const sidebar = buildSidebarFragment(document);
    if (sidebar) {
      params.fragments.push({ element: sidebar, path: SIDEBAR_PATH, report: { fragment: 'sidebar' } });
    }

    // 3. Blocks: parse each instance (skip elements a prior parser already replaced)
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) {
        console.warn(`No parser found for block: ${block.name}`);
        return;
      }
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    // 4. Final cleanup: removes sidebar/post footer, date line, title levels
    executeTransformers('afterTransform', main, payload);

    // 5. Links, metadata and images (no background-image rule: the theme's overlay images are not content)
    rewriteInternalLinks(main);
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without .html; the root maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: meta.Title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
        publicationDate: meta['Publication Date'] || '',
      },
    }, ...params.fragments];
  },
};
