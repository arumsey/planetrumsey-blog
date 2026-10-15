import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPosts, labelUrl, postTags } from '../../scripts/blog-index.js';
import { decoratePostPhotos } from '../../scripts/scripts.js';

/**
 * Fetches a post's content: the published path first, then /content (local preview).
 * @param {string} path post path
 * @returns {Promise<HTMLElement|null>} the post's first section
 */
async function fetchPost(path) {
  let resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) resp = await fetch(`/content${path}.plain.html`);
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();

  // published media is relative to the post (./media_...), not to the page showing it
  const base = new URL(resp.url, window.location.href);
  wrapper.querySelectorAll('img[src^="./media_"]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  wrapper.querySelectorAll('source[srcset^="./media_"]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
  return wrapper.querySelector(':scope > div');
}

/** A photo is "large" when its intrinsic size is at least 1000px wide and landscape. */
const isLarge = (picture) => {
  const img = picture.querySelector('img');
  const w = Number(img?.getAttribute('width')) || 0;
  const h = Number(img?.getAttribute('height')) || 0;
  return w >= 1000 && w > h;
};

/**
 * Re-points a picture's renditions at the widths it is shown at.
 * @param {HTMLPictureElement} picture the picture
 * @param {number} wide rendition from 600px up
 * @param {number} narrow rendition below 600px
 * @returns {HTMLPictureElement} the same picture
 */
function sized(picture, wide, narrow = 750) {
  picture.querySelectorAll('source, img').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    const width = el.media ? wide : narrow;
    el.setAttribute(attr, el.getAttribute(attr).replace(/width=\d+/, `width=${width}`));
  });
  return picture;
}

/**
 * Wraps a photo in a link to the post. Photo links repeat the title link, so they are
 * hidden from assistive technology and skipped by keyboard focus.
 * @param {HTMLPictureElement} picture the picture
 * @param {string} href post path
 * @param {string} className class for the link
 * @returns {HTMLAnchorElement} link
 */
function photoLink(picture, href, className) {
  const a = document.createElement('a');
  a.href = href;
  a.className = className;
  a.tabIndex = -1;
  a.setAttribute('aria-hidden', 'true');
  a.append(picture);
  return a;
}

/**
 * The post's own text paragraphs: before its first heading when there are any there.
 * @param {HTMLElement} section post content
 * @param {number} max how many
 * @returns {HTMLParagraphElement[]} paragraphs
 */
function openingParagraphs(section, max) {
  const text = (p) => p.tagName === 'P' && !p.querySelector('picture') && p.textContent.trim().length > 0;
  const children = [...section.children];
  const firstHeading = children.findIndex((el) => /^H[2-6]$/.test(el.tagName));
  const before = children.slice(0, firstHeading < 0 ? undefined : firstHeading).filter(text);
  return (before.length ? before : children.filter(text)).slice(0, max);
}

function dateLine(section) {
  const first = section.firstElementChild;
  if (!first || first.tagName !== 'P' || first.querySelector('picture')) return null;
  first.className = 'recent-posts-date';
  return first;
}

function titleHeading(entry, section) {
  const heading = document.createElement('h2');
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = section.querySelector('h1')?.textContent.trim() || entry.title || entry.path;
  heading.append(link);
  return heading;
}

function readMore(entry, heading) {
  heading.id = heading.id || `post-${entry.path.split('/').pop()}`;
  const a = document.createElement('a');
  a.href = entry.path;
  a.className = 'button';
  a.textContent = 'Read the whole post';
  a.setAttribute('aria-describedby', heading.id);
  return a;
}

function labelList(entry) {
  const tags = postTags(entry);
  if (!tags.length) return null;
  const ul = document.createElement('ul');
  ul.className = 'recent-posts-labels';
  ul.setAttribute('aria-label', 'Labels');
  tags.forEach((tag) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = labelUrl(tag);
    a.textContent = tag;
    li.append(a);
    ul.append(li);
  });
  return ul;
}

/**
 * The newest post: slab-wide lead photo, date, title, labels, opening paragraphs, a wide
 * sequence of the post's next large photos, then the link to the whole post.
 */
function buildLead(entry, section) {
  const article = document.createElement('article');
  article.className = 'recent-posts-lead';
  const pictures = [...section.querySelectorAll('picture')];
  const large = pictures.filter(isLarge);
  const lead = large[0] || pictures[0];

  if (lead) {
    const img = lead.querySelector('img');
    img.loading = 'eager';
    img.fetchPriority = 'high';
    article.append(photoLink(sized(lead, 1600, 750), entry.path, 'recent-posts-frame'));
  }

  const body = document.createElement('div');
  body.className = 'recent-posts-body';
  const heading = titleHeading(entry, section);
  body.append(...[dateLine(section), heading, labelList(entry)].filter(Boolean));
  const prose = document.createElement('div');
  prose.className = 'recent-posts-prose';
  prose.append(...openingParagraphs(section, 2));
  body.append(prose);
  article.append(body);

  const sequence = large.filter((p) => p !== lead).slice(0, 3);
  if (sequence.length) {
    const div = document.createElement('div');
    div.className = `recent-posts-sequence recent-posts-sequence-${sequence.length}`;
    sequence.forEach((p, i) => div.append(photoLink(sized(p, i === 0 ? 1200 : 750), entry.path, 'recent-posts-photo')));
    article.append(div);
  }

  const actions = document.createElement('div');
  actions.className = 'recent-posts-actions';
  actions.append(readMore(entry, heading));
  if (pictures.length > 1) {
    const meta = document.createElement('p');
    meta.className = 'recent-posts-meta';
    meta.textContent = `${pictures.length} photos`;
    actions.append(meta);
  }
  article.append(actions);
  return article;
}

/** Older posts: date, title, first photo beside the first paragraph, link to the post. */
function buildEntry(entry, section) {
  const article = document.createElement('article');
  article.className = 'recent-posts-entry';
  const head = document.createElement('header');
  const heading = titleHeading(entry, section);
  head.append(...[dateLine(section), heading].filter(Boolean));
  article.append(head);

  const picture = section.querySelector('picture');
  if (picture) article.append(photoLink(sized(picture, 750, 750), entry.path, 'recent-posts-photo'));

  const text = document.createElement('div');
  text.className = 'recent-posts-text';
  text.append(...openingParagraphs(section, 1));
  const actions = document.createElement('div');
  actions.className = 'recent-posts-actions';
  actions.append(readMore(entry, heading));
  text.append(actions);
  article.append(text);
  return article;
}

/**
 * loads and decorates the recent posts block: the newest post as the lead story, the rest as
 * compact entries
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const count = Math.max(1, parseInt(config.count, 10) || 2);
  const indexPath = config.index || '/query-index.json';
  block.textContent = '';

  const entries = (await fetchPosts(indexPath)).slice(0, count);
  const sections = await Promise.all(entries.map((entry) => fetchPost(entry.path)));
  const posts = entries.map((entry, i) => {
    const section = sections[i];
    if (!section) return null;
    decoratePostPhotos(section);
    return i === 0 ? buildLead(entry, section) : buildEntry(entry, section);
  });
  block.append(...posts.filter(Boolean));
}
