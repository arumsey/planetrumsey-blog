import { readBlockConfig } from '../../scripts/aem.js';
import {
  archiveUrl, fetchPosts, labelUrl, monthLabel, postMonth, postTags,
} from '../../scripts/blog-index.js';

/**
 * Counts posts per key, keeping the first spelling seen for display.
 * @param {Object[]} posts index entries
 * @param {Function} keysFor entry => string[]
 * @returns {Map<string, {label: string, count: number}>} counts by lower-cased key
 */
function countBy(posts, keysFor) {
  const counts = new Map();
  posts.forEach((entry) => keysFor(entry).forEach((label) => {
    const key = label.toLowerCase();
    const current = counts.get(key) || { label, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }));
  return counts;
}

/**
 * loads and decorates the archive links block: blog months or labels with post counts
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const type = (config.type || 'months').toLowerCase().startsWith('label') ? 'labels' : 'months';
  block.textContent = '';
  block.dataset.type = type;

  const posts = await fetchPosts(config.index || '/query-index.json');
  let items;
  if (type === 'months') {
    items = [...countBy(posts, (entry) => [postMonth(entry)]).values()]
      .sort((a, b) => b.label.localeCompare(a.label))
      .map(({ label, count }) => ({ text: monthLabel(label), href: archiveUrl(label), count }));
  } else {
    items = [...countBy(posts, postTags).values()]
      .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))
      .map(({ label, count }) => ({ text: label, href: labelUrl(label), count }));
  }

  const ul = document.createElement('ul');
  items.forEach(({ text, href, count }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    const total = document.createElement('span');
    total.className = 'archive-links-count';
    total.textContent = `(${count})`;
    li.append(a, total);
    ul.append(li);
  });
  block.append(ul);
}
