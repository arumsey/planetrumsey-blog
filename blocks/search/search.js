import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPosts, labelUrl, postTags } from '../../scripts/blog-index.js';

/* Client-side search over the query index, after the AEM Block Collection search block:
 * posts whose title, summary, labels or address contain every search term, title matches
 * first, with the matching terms highlighted. The query is kept in the page URL (?q=).
 * Imports only long-standing blog-index exports: browsers cache scripts separately, so a
 * visitor can pair this file with an older cached blog-index.js. */

const MIN_QUERY_LENGTH = 2;

/**
 * Long date for a post, e.g. "Monday, August 19, 2019" (as on the archive pages).
 * @param {Object} entry query index entry
 * @returns {string} formatted date, or '' when the index has none
 */
function postDate(entry) {
  const match = (entry.publicationDate || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  const [, y, m, d] = match.map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

/**
 * The search terms in a query: lower-cased words, without duplicates.
 * @param {string} query what the reader typed
 * @returns {string[]} terms
 */
const toTerms = (query) => [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))];

/**
 * Wraps every occurrence of the terms in an element's text in <mark>.
 * @param {Element} element element holding plain text
 * @param {string[]} terms search terms
 */
function highlight(element, terms) {
  const text = element.textContent;
  const lower = text.toLowerCase();
  const ranges = [];
  terms.forEach((term) => {
    for (let i = lower.indexOf(term); i >= 0; i = lower.indexOf(term, i + term.length)) {
      ranges.push([i, i + term.length]);
    }
  });
  if (!ranges.length) return;
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const fragment = document.createDocumentFragment();
  let pos = 0;
  ranges.forEach(([start, end]) => {
    if (end <= pos) return;
    const from = Math.max(start, pos);
    if (from > pos) fragment.append(text.slice(pos, from));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(from, end);
    fragment.append(mark);
    pos = end;
  });
  fragment.append(text.slice(pos));
  element.replaceChildren(fragment);
}

/**
 * Posts matching every term, best first: matches in the title, then the rest, each newest first.
 * @param {Object[]} posts index entries, newest first
 * @param {string[]} terms search terms
 * @returns {Object[]} matching entries
 */
function findPosts(posts, terms) {
  const inTitle = [];
  const elsewhere = [];
  posts.forEach((entry) => {
    const title = (entry.title || '').toLowerCase();
    const text = [
      title,
      entry.description || '',
      postTags(entry).join(' '),
      entry.path.split('/').pop().replace(/-/g, ' '),
    ].join(' ').toLowerCase();
    if (!terms.every((term) => text.includes(term))) return;
    (terms.some((term) => title.includes(term)) ? inTitle : elsewhere).push(entry);
  });
  return [...inTitle, ...elsewhere];
}

/**
 * The heading level for result titles: one below the last heading before the block.
 * @param {Element} block the block
 * @returns {string} tag name, e.g. H2
 */
function resultHeadingTag(block) {
  const headings = [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5')]
    .filter((h) => h.compareDocumentPosition(block) === Node.DOCUMENT_POSITION_FOLLOWING);
  const last = headings.pop();
  return last ? `H${Math.min(Number(last.tagName[1]) + 1, 6)}` : 'H2';
}

/**
 * One result: date line, then a card with photo, linked title, summary and labels.
 * @param {Object} entry query index entry
 * @param {string[]} terms search terms
 * @param {string} headingTag tag for the title
 * @returns {HTMLLIElement} list item
 */
function buildResult(entry, terms, headingTag) {
  const li = document.createElement('li');
  li.className = 'search-result';

  const date = postDate(entry);
  if (date) {
    const p = document.createElement('p');
    p.className = 'search-result-date';
    p.textContent = date;
    li.append(p);
  }

  const card = document.createElement('div');
  card.className = 'search-result-card';
  if (entry.image && !entry.image.includes('default-meta-image')) {
    const imageLink = document.createElement('a');
    imageLink.href = entry.path;
    imageLink.className = 'search-result-image';
    imageLink.setAttribute('aria-hidden', 'true');
    imageLink.tabIndex = -1;
    imageLink.append(createOptimizedPicture(entry.image, '', false, [{ width: '400' }]));
    card.append(imageLink);
  }

  const heading = document.createElement(headingTag);
  heading.className = 'search-result-title';
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = entry.title || entry.path;
  highlight(link, terms);
  heading.append(link);
  card.append(heading);

  if (entry.description) {
    const p = document.createElement('p');
    p.className = 'search-result-description';
    p.textContent = entry.description;
    highlight(p, terms);
    card.append(p);
  }

  const tags = postTags(entry);
  if (tags.length) {
    const ul = document.createElement('ul');
    ul.className = 'search-result-labels';
    ul.setAttribute('aria-label', 'Labels');
    tags.forEach((tag) => {
      const tagItem = document.createElement('li');
      const a = document.createElement('a');
      a.href = labelUrl(tag);
      a.textContent = tag;
      highlight(a, terms);
      tagItem.append(a);
      ul.append(tagItem);
    });
    card.append(ul);
  }

  li.append(card);
  return li;
}

/**
 * Keeps the query in the page URL so results can be shared and survive a reload.
 * @param {string} query the query
 */
function updateUrl(query) {
  const url = new URL(window.location.href);
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url);
}

/**
 * loads and decorates the search block: a search box and the matching posts.
 * An optional link in the block points at a different query index.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const source = block.querySelector('a[href]')?.getAttribute('href') || '/query-index.json';
  const headingTag = resultHeadingTag(block);
  block.textContent = '';

  const form = document.createElement('form');
  form.className = 'search-box';
  form.setAttribute('role', 'search');
  form.action = window.location.pathname;
  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.htmlFor = 'search-input';
  label.textContent = 'Search posts';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'search-input';
  input.name = 'q';
  input.className = 'search-input';
  input.placeholder = 'Search posts by place, trip or label';
  input.autocomplete = 'off';
  input.setAttribute('enterkeyhint', 'search');
  form.append(label, input);

  const status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  const results = document.createElement('ul');
  results.className = 'search-results';
  block.append(form, status, results);

  const render = async () => {
    const query = input.value.trim();
    const terms = toTerms(query);
    if (query.length < MIN_QUERY_LENGTH) {
      results.replaceChildren();
      status.textContent = '';
      return;
    }
    const posts = await fetchPosts(source);
    if (input.value.trim() !== query) return; // a newer query is already rendering
    const matches = findPosts(posts, terms);
    results.replaceChildren(...matches.map((entry) => buildResult(entry, terms, headingTag)));
    if (!matches.length) status.textContent = `No posts match “${query}”.`;
    else status.textContent = `${matches.length} ${matches.length === 1 ? 'post matches' : 'posts match'} “${query}”`;
  };

  input.addEventListener('input', () => {
    updateUrl(input.value.trim());
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });

  const query = new URLSearchParams(window.location.search).get('q');
  if (query) {
    input.value = query;
    render();
  }
}
