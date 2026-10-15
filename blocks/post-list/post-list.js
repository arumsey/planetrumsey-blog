import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import {
  fetchPosts, labelUrl, monthLabel, postMonth, postTags,
} from '../../scripts/blog-index.js';

/**
 * Long date for a post, e.g. "Monday, August 19, 2019".
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
 * One post summary: date line, then a card with image, linked title and description.
 * @param {Object} entry query index entry
 * @returns {HTMLElement} list item
 */
function buildPost(entry) {
  const li = document.createElement('li');
  li.className = 'post-list-post';

  const date = postDate(entry);
  if (date) {
    const p = document.createElement('p');
    p.className = 'post-list-date';
    p.textContent = date;
    li.append(p);
  }

  const card = document.createElement('div');
  card.className = 'post-list-card';
  if (entry.image && !entry.image.includes('default-meta-image')) {
    const imageLink = document.createElement('a');
    imageLink.href = entry.path;
    imageLink.className = 'post-list-image';
    imageLink.setAttribute('aria-hidden', 'true');
    imageLink.tabIndex = -1;
    imageLink.append(createOptimizedPicture(entry.image, '', false, [{ width: '400' }]));
    card.append(imageLink);
  }
  const heading = document.createElement('h3');
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = entry.title || entry.path;
  heading.append(link);
  card.append(heading);
  if (entry.description) {
    const p = document.createElement('p');
    p.textContent = entry.description;
    card.append(p);
  }
  li.append(card);
  return li;
}

/**
 * Every label with its post count, as links to the labels page.
 * @param {Object[]} posts index entries
 * @returns {HTMLElement} list
 */
function buildLabelList(posts) {
  const counts = new Map();
  posts.forEach((entry) => postTags(entry).forEach((tag) => {
    const key = tag.toLowerCase();
    const current = counts.get(key) || { tag, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }));
  const ul = document.createElement('ul');
  ul.className = 'post-list-labels';
  [...counts.values()]
    .sort((a, b) => a.tag.localeCompare(b.tag, 'en', { sensitivity: 'base' }))
    .forEach(({ tag, count }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = labelUrl(tag);
      a.textContent = tag;
      li.append(a, ` (${count})`);
      ul.append(li);
    });
  return ul;
}

/**
 * loads and decorates the post list block: the posts for the month or label in the page URL
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const filter = (config.filter || 'month').toLowerCase() === 'label' ? 'label' : 'month';
  const value = (new URLSearchParams(window.location.search).get(filter) || '').trim();
  block.textContent = '';

  const posts = await fetchPosts(config.index || '/query-index.json');

  const heading = document.createElement('h2');
  heading.className = 'post-list-heading';
  block.append(heading);

  if (filter === 'label' && !value) {
    heading.textContent = 'All labels';
    block.append(buildLabelList(posts));
    return;
  }

  let matches = posts;
  if (filter === 'month' && value) {
    matches = posts.filter((entry) => postMonth(entry) === value);
    heading.textContent = /^\d{4}-\d{2}$/.test(value) ? `Posts from ${monthLabel(value)}` : 'Posts';
  } else if (filter === 'label') {
    const wanted = value.toLowerCase();
    matches = posts.filter((entry) => postTags(entry).some((tag) => tag.toLowerCase() === wanted));
    heading.textContent = `Posts labeled “${value}”`;
  } else {
    heading.textContent = 'All posts';
  }

  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'post-list-empty';
    empty.textContent = 'No posts found.';
    block.append(empty);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'post-list-posts';
  ul.append(...matches.map(buildPost));
  block.append(ul);
}
