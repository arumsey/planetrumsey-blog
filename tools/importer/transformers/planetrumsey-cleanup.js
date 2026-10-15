/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: planetrumsey (Blogger "Picture Window" theme) site-wide cleanup.
 *
 * All selectors verified in migration-work/cleaned.html (homepage) and
 * catalog/.pages/<slug>/page.html (post pages):
 *   body > #navbar, .body-fauxcolumns, .content-fauxcolumns, .fauxcolumn-outer,
 *   .tabs-outer, .cap-top, .cap-bottom, .content-inner > header,
 *   .content-inner > footer, .column-left-outer, .column-right-outer,
 *   #comments (post pages), #blog-pager, .post-feeds (post pages),
 *   .post-share-buttons, .inline-ad, .post-header, .clear, .post-footer,
 *   h2.date-header, h3.post-title, .post.hentry.
 *   .jump-link is not present in any captured page; kept defensively.
 *
 * The right sidebar (.column-right-outer) and .post-footer are only removed in
 * afterTransform: the import script reads them (shared sidebar fragment,
 * timestamp/labels/location metadata) before cleanup finishes.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// goo.gl/maps short links in post bodies → their Google Maps targets (resolved 2026-10-15)
const RESOLVED_MAP_LINKS = {
  'https://goo.gl/maps/uMzbnjfYDbGJEfM49': 'https://maps.google.com/?q=Alajuela+Province,+Sarchi&ftid=0x8fa0596559c82661:0x6fb47b55d280c3be',
  'https://goo.gl/maps/6FohMQjuMpjxoMku9': 'https://maps.google.com/?q=Playa+Barrigona,+Guanacaste+Province&ftid=0x8f9faa9992f0ba77:0x444831972d6c4cdd',
  'https://goo.gl/maps/hWs9TQf8vyqpeYQJ6': 'https://maps.google.com/?q=Lo+Que+Hay,+Provincia+de+Guanacaste,+S%C3%A1mara&ftid=0x8f9faa048d8c3e9f:0x7b84e05f3a1f72c1',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Embeds in post bodies (Instagram reel, Blogger video) become plain links
    // before iframes are removed: the project has no embed block.
    // Videos hosted in Blogger's own player have no file to migrate, so they are dropped
    // (the site keeps no links back to Blogger).
    const doc = element.ownerDocument || document;
    element.querySelectorAll('.post-body iframe[src]').forEach((iframe) => {
      let href = iframe.getAttribute('src');
      let label = 'Watch the video';
      if (/(^|\.)blogger\.com\/video\.g/.test(href)) {
        iframe.remove();
        return;
      }
      const instagram = href.match(/instagram\.com\/(reel|p)\/([^/?#]+)/);
      if (instagram) {
        href = `https://www.instagram.com/${instagram[1]}/${instagram[2]}/`;
        label = 'View on Instagram';
      }
      const p = doc.createElement('p');
      const a = doc.createElement('a');
      a.href = href;
      a.textContent = label;
      p.append(a);
      iframe.replaceWith(p);
    });

    // Place links pasted as "Place name, https://goo.gl/maps/…" into the link field: Blogger
    // made them relative, so they point at www.blogger.com/<text>. Use the embedded map link,
    // resolved to its Google Maps target (goo.gl short links are being retired).
    element.querySelectorAll('.post-body a[href*="blogger.com/"]').forEach((a) => {
      const decoded = decodeURIComponent(a.getAttribute('href').replace(/^https?:\/\/(www\.)?blogger\.com\//, ''));
      const embedded = decoded.match(/https?:\/\/\S+$/);
      if (!embedded) return;
      a.setAttribute('href', RESOLVED_MAP_LINKS[embedded[0]] || embedded[0]);
    });

    // Photos pasted inside a stray code block (<pre><code>) would be dropped as code:
    // unwrap the block so its images stay in the post.
    element.querySelectorAll('.post-body pre').forEach((pre) => {
      if (!pre.querySelector('img')) return;
      const inner = pre.querySelector(':scope > code') || pre;
      pre.replaceWith(...inner.childNodes);
    });

    WebImporter.DOMUtils.remove(element, [
      // Blogger navbar + decorative chrome
      '#navbar',
      '.body-fauxcolumns',
      '.content-fauxcolumns',
      '.fauxcolumn-outer',
      '.tabs-outer',
      '.cap-top',
      '.cap-bottom',
      '.clear',
      // Site header / footer (migrated separately)
      '.content-inner > header',
      '.content-inner > footer',
      // Empty left column
      '.column-left-outer',
      // Post chrome
      '#comments',
      '#blog-pager',
      '.post-feeds',
      '.blog-feeds',
      '.post-share-buttons',
      '.inline-ad',
      '.jump-link',
      '.post-header',
      // Non-content elements
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    const doc = element.ownerDocument || document;

    // Date line above the title: h2.date-header -> plain <p>
    element.querySelectorAll('h2.date-header').forEach((h2) => {
      const p = doc.createElement('p');
      p.textContent = h2.textContent.trim();
      h2.replaceWith(p);
    });

    // Post title: h1 on single-post pages, h2 on multi-post pages (homepage)
    const postCount = element.querySelectorAll('.post.hentry').length;
    const headingTag = postCount === 1 ? 'h1' : 'h2';
    element.querySelectorAll('h3.post-title').forEach((h3) => {
      const heading = doc.createElement(headingTag);
      heading.innerHTML = h3.innerHTML.trim();
      h3.replaceWith(heading);
    });

    // Removed late: read by the import script before cleanup finishes
    WebImporter.DOMUtils.remove(element, [
      '.column-right-outer',
      '.post-footer',
    ]);
  }
}
