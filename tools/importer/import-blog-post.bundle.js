/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-blog-post.js
  var import_blog_post_exports = {};
  __export(import_blog_post_exports, {
    default: () => import_blog_post_default
  });

  // tools/importer/parsers/recent-posts.js
  function parse(element, { document: document2 }) {
    const posts = element.matches(".blog-posts") ? element : element.querySelector(".blog-posts");
    if (!posts) return;
    const count = posts.querySelectorAll(".post.hentry").length || 2;
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Recent Posts",
      cells: [["count", String(count)]]
    });
    posts.replaceWith(block);
  }

  // tools/importer/transformers/planetrumsey-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const doc = element.ownerDocument || document;
      element.querySelectorAll(".post-body iframe[src]").forEach((iframe) => {
        let href = iframe.getAttribute("src");
        let label = "Watch the video";
        const instagram = href.match(/instagram\.com\/(reel|p)\/([^/?#]+)/);
        if (instagram) {
          href = `https://www.instagram.com/${instagram[1]}/${instagram[2]}/`;
          label = "View on Instagram";
        }
        const p = doc.createElement("p");
        const a = doc.createElement("a");
        a.href = href;
        a.textContent = label;
        p.append(a);
        iframe.replaceWith(p);
      });
      element.querySelectorAll(".post-body pre").forEach((pre) => {
        if (!pre.querySelector("img")) return;
        const inner = pre.querySelector(":scope > code") || pre;
        pre.replaceWith(...inner.childNodes);
      });
      WebImporter.DOMUtils.remove(element, [
        // Blogger navbar + decorative chrome
        "#navbar",
        ".body-fauxcolumns",
        ".content-fauxcolumns",
        ".fauxcolumn-outer",
        ".tabs-outer",
        ".cap-top",
        ".cap-bottom",
        ".clear",
        // Site header / footer (migrated separately)
        ".content-inner > header",
        ".content-inner > footer",
        // Empty left column
        ".column-left-outer",
        // Post chrome
        "#comments",
        "#blog-pager",
        ".post-feeds",
        ".blog-feeds",
        ".post-share-buttons",
        ".inline-ad",
        ".jump-link",
        ".post-header",
        // Non-content elements
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      const doc = element.ownerDocument || document;
      element.querySelectorAll("h2.date-header").forEach((h2) => {
        const p = doc.createElement("p");
        p.textContent = h2.textContent.trim();
        h2.replaceWith(p);
      });
      const postCount = element.querySelectorAll(".post.hentry").length;
      const headingTag = postCount === 1 ? "h1" : "h2";
      element.querySelectorAll("h3.post-title").forEach((h3) => {
        const heading = doc.createElement(headingTag);
        heading.innerHTML = h3.innerHTML.trim();
        h3.replaceWith(heading);
      });
      WebImporter.DOMUtils.remove(element, [
        ".column-right-outer",
        ".post-footer"
      ]);
    }
  }

  // tools/importer/transformers/planetrumsey-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/planetrumsey-image-fixes.js
  var TransformHook2 = { beforeTransform: "beforeTransform" };
  var RECOVERED_DRIVE_FILES = {
    "AFGJ81paTts0h2C5lnY8V_bsmFZ3ASDK6Nr-kgkT": "1IOE93nAYqGrclq8AU-55mhoXnlg5Ei3U",
    "AFGJ81oTocA-EJC1jOSTV2uQd-WIPwWcGITVqM51": "11SVC6OYywQ5-mbhd4sQ6eWnXu6ivAXiU",
    "AFGJ81pW4yfTEDNt65qi8c0yvKiwXZdZ5N_KGVGA": "1iZMhmREIIh2J822gDNDj_3nqE9hfex5P",
    "AFGJ81rzIKxHjdCXCkED95e_0MY8Gt_-ObB78wCq": "1v3-pVbfXrekz0vgDjqP3lzHXDlGbtrcF",
    "AFGJ81rhuVwkDcPMqonMQmP0WkdoTIkx5dFoxU-v": "1fSgAfYpjVckS2argetpwK40Pz8IL6y-f",
    "AFGJ81ryEis3CTLuwmRLBdud24K7u3s3D2jDvqds": "1a8lJVfZTbYQo0un_TI8QSrW4shtR4w7_",
    "AFGJ81pKhnWUrLiJatvv_ji4d4D0ZAPrkxowDnaA": "1NI8vQD8b-VFjABPZoC35zXJ_alyxudd5",
    "AFGJ81pBvbaVM5zqljgMfWL0qkRg68IeNzP2WHpA": "1QLAMqz-lwarR_CTuleEsQowbX6Q1Rds3",
    "AFGJ81ozBJtnEK9SgjsfcxwM8b1fsLKT13bg3JJv": "1caCRf2I2udJTL-joEgVRkF21xFqOfDBP",
    "AFGJ81pJgaXbbjJC8mIFFbeyh-K2CWwU7lrKINc4": "1GmezbWwRX8ykVCzgot75Sfbn9aLBcPeo",
    "AFGJ81pM0aLr_2Q8JDbC_XTbrDmrNWuaqzoqeUAq": "13vvu4DYmvKEldWFSSrC2DbBIle1-gq1n",
    "AFGJ81omAbqiunTiKDQgPM-FWV8lQ-u9g1IIUQYr": "1aXF-g3Ucu7duJws6qNXtkTeBfYVS7QV4",
    "AFGJ81pvDPNi7EZ9AV14mcJhPORlXu4gAfUKhxga": "1feXZlt7S2P_Cuhz1uqbbG_HTEQQeFaNg",
    "AFGJ81q145sviqRpVDCRvwm3he9mM8NCXwCBKQcB": "1eWVM1wBq91sjwgs791yj9X0CPKb_Z9fn",
    "AFGJ81qjOwo1qEEtsCEzzVXjBaxogjNcSz-9Ns3K": "10KMt1nJRBxw_fMj_eQpUsSQhm8pWExfO",
    "AFGJ81oMgD2lkk0vQUhtJTzaV5YfXZzTRWlgu2Jv": "1pd4CHAZQcuPjHg7JHwiZS6Z8uieeP8Vm",
    "AFGJ81qeqV-9JGxy1myX7eLw4FwpRpdmqONCoU4J": "1Vi8MvBS51vW4Fq5nSN0mpjzhsqdUqvz0",
    "AFGJ81q_U7d1rpSvhyaVYhiw5Gzvigec0W65pol0": "1dWzwTcH4e9YKHTjvUXqAk_7cnRrePajk",
    "AFGJ81qBRWIXf6n5Y9WIlRtVHqQrA2EWZCVMdWqv": "1avv9DMkinqRoJQr4ONURX8I3SXw_Vu5o",
    "AFGJ81pHqIBF8l6PkWaGkBJ0B9Zb4Xvuy9WBDSgN": "1AeK_CcyHAeeuPOGQQEG16DF7J5wk3UDF",
    "AFGJ81ojnQi3C5VrWmgBsC1C00v1qaASDqhOV3RV": "1wjmAdA11oVb7EkbFTXZuErKSYXD0-5IM",
    "AFGJ81qO1dfGaJzp5MqRJklrHrLyc9T9cs97z-YP": "1hUpA0AjIqDBXa0twOXhX8n_7bzxSSHmu",
    "AFGJ81pIknZTZmLiDAVtMnh3siIO8jtAzrkzhU-8": "1xsMxEvAiO5c0vpdpm2Py_7gpteauIslx",
    "AFGJ81pw2Ns_UvT1HDjEzB-THqyammzCb3FJLpYW": "1m5Q9XXLaxMVCH4-wH65tXd_IY3KV0HfV",
    "AFGJ81rQoxu4ARcizuNiH1A8ZSh1WzNgjPnB7EOc": "1AuBxESg65E_nAp1g2iiALIT9CmPs43Qr",
    "AFGJ81rxtIIIGSYHbmHhjDpT8Z5ZNO1hv5N6ZoGc": "1HJXCxp_OodnfALZlto-1f7UeJFhBedzA",
    "AFGJ81qfSpP4qLXWWDmHXf8vEazxXKhjrMfsr7kT": "1hs0oRA5NoWmElc6otjnXS6R7kvfs5bdL",
    "AFGJ81qF4Wkc1f2NYDPrRQ_hSVwMR5jIeYFL1nuv": "1luMNj1V1G5Zzl77wXHmtDYztvlBC2Kwr",
    "AFGJ81qfAhHB_cyU5C3imv-fWxSat8fSImMJuxaD": "17Dat6CS5m3wMhQXV3Ap7zu1apjsy1GHl",
    "AFGJ81r34EN3wiQ9npL9948GH3W3N_qdi08Wg13P": "1_MeWXz0pVLOy9Jq13GGpjH9Ht93mqvoC",
    "AFGJ81oG_e6sjurmn0ASfU3wz9G1bAxXn2XDynJd": "1D7jdweriCGVtSrhBJrJbRt93vPolcUx3"
  };
  var driveImage = (fileId) => `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
  var recoveredFor = (url) => {
    const token = (url || "").match(/drive-viewer\/([A-Za-z0-9_-]{40})/);
    return token ? RECOVERED_DRIVE_FILES[token[1]] : null;
  };
  function transform3(hookName, element) {
    if (hookName !== TransformHook2.beforeTransform) return;
    element.querySelectorAll('img[src*="/drive-viewer/"]').forEach((img) => {
      const fileId = recoveredFor(img.getAttribute("src"));
      if (!fileId) return;
      img.setAttribute("src", driveImage(fileId));
      img.removeAttribute("srcset");
      const link = img.closest('a[href*="/drive-viewer/"]');
      if (link) link.setAttribute("href", driveImage(fileId));
    });
  }

  // tools/importer/import-blog-post.js
  var parsers = {
    "recent-posts": parse
  };
  var SITE_ORIGIN = "https://blog.planetrumsey.ca";
  var SITE_TITLE = "planetrumsey";
  var SIDEBAR_PATH = "/fragments/sidebar";
  var EXCLUDED_SOCIAL_HOSTS = ["twitter.com", "x.com"];
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform3,
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      document2.querySelectorAll(selector).forEach((element) => {
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
  function toSitePath(href) {
    if (!href) return null;
    let u;
    try {
      u = new URL(href, SITE_ORIGIN);
    } catch (e) {
      return null;
    }
    if (u.hostname !== new URL(SITE_ORIGIN).hostname) return null;
    let path = u.pathname.replace(/\.html?$/, "");
    if (path !== "/") path = path.replace(/\/$/, "");
    return `${path}${u.search}${u.hash}`;
  }
  function rewriteInternalLinks(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const path = toSitePath(a.getAttribute("href"));
      if (path) a.setAttribute("href", path);
    });
  }
  function extractMetadata(document2) {
    var _a, _b, _c, _d, _e, _f, _g;
    const posts = document2.querySelectorAll(".post.hentry");
    const isPost = posts.length === 1;
    const first = posts[0];
    const meta = {};
    const ogTitle = document2.querySelector('meta[property="og:title"]');
    const postTitle = (_a = first == null ? void 0 : first.querySelector(".post-title")) == null ? void 0 : _a.textContent.trim();
    meta.Title = isPost ? postTitle || (ogTitle == null ? void 0 : ogTitle.content) || document2.title : SITE_TITLE;
    const bodyText = ((_b = first == null ? void 0 : first.querySelector(".post-body")) == null ? void 0 : _b.textContent.replace(/\s+/g, " ").trim()) || "";
    const ogDescription = (_c = document2.querySelector('meta[property="og:description"]')) == null ? void 0 : _c.content;
    const description = (isPost ? bodyText || ogDescription : "travel ~ explore ~ repeat") || "";
    if (description) {
      meta.Description = description.length > 160 ? `${description.slice(0, 157).trim()}...` : description;
    }
    const ogImage = (_d = document2.querySelector('meta[property="og:image"]')) == null ? void 0 : _d.content;
    const firstImg = (_e = first == null ? void 0 : first.querySelector(".post-body img")) == null ? void 0 : _e.getAttribute("src");
    const imageSrc = ogImage && !/\/drive-viewer\//.test(ogImage) ? ogImage : firstImg;
    if (imageSrc) {
      const img = document2.createElement("img");
      img.src = imageSrc;
      meta.Image = img;
    }
    if (isPost) {
      const published = first.querySelector('.post-timestamp abbr.published, .post-timestamp [itemprop="datePublished"]');
      const iso = published == null ? void 0 : published.getAttribute("title");
      if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
        meta["Publication Date"] = iso.slice(0, 10);
      } else {
        const dateText = (_f = document2.querySelector(".date-header")) == null ? void 0 : _f.textContent.trim();
        const parsed = dateText ? new Date(dateText) : null;
        if (parsed && !Number.isNaN(parsed.getTime())) {
          const pad = (n) => String(n).padStart(2, "0");
          meta["Publication Date"] = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
        }
      }
      const tags = [...first.querySelectorAll(".post-labels a")].map((a) => a.textContent.trim()).filter(Boolean);
      if (tags.length) meta.Tags = tags.join(", ");
      const location = (_g = first.querySelector(".post-location")) == null ? void 0 : _g.textContent.replace(/\s+/g, " ").replace(/^\s*Location:\s*/i, "").trim();
      if (location) meta.Location = location;
    }
    return meta;
  }
  function buildSidebarFragment(document2) {
    const sidebar = document2.querySelector(".column-right-outer #sidebar-right-1");
    if (!sidebar) return null;
    const root = document2.createElement("div");
    const social = sidebar.querySelector("#HTML2 .widget-content");
    if (social) {
      const ul = document2.createElement("ul");
      social.querySelectorAll("a[href]").forEach((a) => {
        const host = (() => {
          try {
            return new URL(a.href).hostname.replace(/^www\./, "");
          } catch (e) {
            return "";
          }
        })();
        if (EXCLUDED_SOCIAL_HOSTS.includes(host)) return;
        const li = document2.createElement("li");
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        const img = a.querySelector("img");
        if (img) {
          const icon = document2.createElement("img");
          icon.src = img.getAttribute("src");
          const host2 = (() => {
            try {
              return new URL(link.href).hostname.replace(/^www\./, "");
            } catch (e) {
              return "";
            }
          })();
          icon.alt = host2.split(".")[0] || "social";
          link.append(icon);
        } else {
          link.textContent = a.textContent.trim();
        }
        li.append(link);
        ul.append(li);
      });
      if (ul.children.length) root.append(ul);
    }
    const addArchiveLinks = (widgetSelector, type) => {
      const widget = sidebar.querySelector(widgetSelector);
      if (!widget) return;
      const heading = widget.querySelector("h2");
      if (heading) {
        const h2 = document2.createElement("h2");
        h2.textContent = heading.textContent.trim();
        root.append(h2);
      }
      root.append(WebImporter.Blocks.createBlock(document2, {
        name: "Archive Links",
        cells: [["type", type]]
      }));
    };
    addArchiveLinks("#BlogArchive1", "months");
    addArchiveLinks("#Label1", "labels");
    if (!root.children.length) return null;
    rewriteInternalLinks(root);
    return root;
  }
  var import_blog_post_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      executeTransformers("beforeTransform", main, payload);
      const meta = extractMetadata(document2);
      const sidebar = buildSidebarFragment(document2);
      if (sidebar) {
        params.fragments.push({ element: sidebar, path: SIDEBAR_PATH, report: { fragment: "sidebar" } });
      }
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) {
          console.warn(`No parser found for block: ${block.name}`);
          return;
        }
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      rewriteInternalLinks(main);
      main.append(document2.createElement("hr"));
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: meta.Title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
          publicationDate: meta["Publication Date"] || ""
        }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_blog_post_exports);
})();
