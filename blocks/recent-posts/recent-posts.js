import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPosts } from '../../scripts/blog-index.js';

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

/**
 * Builds one post: date line, then a card with the title (linked to the post) and the body.
 * @param {Object} entry query index entry
 * @param {HTMLElement} section the post's first section
 * @returns {HTMLElement} article element
 */
function buildPost(entry, section) {
  const article = document.createElement('article');
  article.className = 'recent-posts-post';

  const title = section.querySelector('h1');
  const heading = document.createElement('h2');
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = (title && title.textContent.trim()) || entry.title || entry.path;
  heading.append(link);
  if (title) title.replaceWith(heading);
  else section.prepend(heading);

  const date = heading.previousElementSibling;
  if (date && date.tagName === 'P') {
    date.className = 'recent-posts-date';
    article.append(date);
  }

  const card = document.createElement('div');
  card.className = 'recent-posts-card';
  card.append(...section.childNodes);
  article.append(card);
  return article;
}

/**
 * loads and decorates the recent posts block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const count = Math.max(1, parseInt(config.count, 10) || 2);
  const indexPath = config.index || '/query-index.json';
  block.textContent = '';

  const entries = (await fetchPosts(indexPath)).slice(0, count);
  const posts = await Promise.all(entries.map(async (entry) => {
    const section = await fetchPost(entry.path);
    return section ? buildPost(entry, section) : null;
  }));
  block.append(...posts.filter(Boolean));
}
