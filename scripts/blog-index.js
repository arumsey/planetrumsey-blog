/*
 * Blog post data from the site query index, shared by the recent-posts, post-list and
 * archive-links blocks.
 */

const POST_PATH = /^\/(\d{4})\/(\d{2})\/[^/]+$/;
const indexCache = {};

/**
 * The month a post belongs to (yyyy-mm): its publication date, else the /yyyy/mm/ in its path.
 * @param {Object} entry query index entry
 * @returns {string} yyyy-mm
 */
export function postMonth(entry) {
  const date = entry.publicationDate || '';
  if (/^\d{4}-\d{2}/.test(date)) return date.slice(0, 7);
  const [, year, month] = entry.path.match(POST_PATH);
  return `${year}-${month}`;
}

/**
 * Sort key for a post: publication date when indexed, else the /yyyy/mm/ in its path.
 * @param {Object} entry query index entry
 * @returns {string} sortable key
 */
function sortKey(entry) {
  const date = entry.publicationDate || '';
  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : postMonth(entry);
}

/**
 * A post's labels as an array (the index may return an array or a JSON-encoded string).
 * @param {Object} entry query index entry
 * @returns {string[]} labels
 */
export function postTags(entry) {
  const { tags } = entry;
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags.trim().startsWith('[')) {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  }
  return typeof tags === 'string' && tags.trim() ? tags.split(',').map((t) => t.trim()) : [];
}

/**
 * Fetches all blog posts from the query index, newest first.
 * @param {string} [indexPath] path of the query index
 * @returns {Promise<Object[]>} index entries for /yyyy/mm/slug pages
 */
export async function fetchPosts(indexPath = '/query-index.json') {
  if (!indexCache[indexPath]) {
    indexCache[indexPath] = fetch(indexPath)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then(({ data = [] }) => data
        .filter((entry) => POST_PATH.test(entry.path || ''))
        .sort((a, b) => sortKey(b).localeCompare(sortKey(a))
          || Number(b.lastModified || 0) - Number(a.lastModified || 0)))
      .catch(() => []);
  }
  return indexCache[indexPath];
}

/**
 * Human-readable month name, e.g. "August 2019".
 * @param {string} month yyyy-mm
 * @returns {string} label
 */
export function monthLabel(month) {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Link to the archive page for a month, and to the labels page for a label.
 */
export const archiveUrl = (month) => `/archive?month=${encodeURIComponent(month)}`;
export const labelUrl = (label) => `/labels?label=${encodeURIComponent(label)}`;
