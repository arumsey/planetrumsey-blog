/* eslint-disable */
/* global WebImporter */

/**
 * Parser: recent-posts (homepage).
 * The source homepage shows the newest posts in full (#Blog1 .blog-posts, one .date-outer per post).
 * The migrated homepage pulls them in at runtime instead, so the copied posts are replaced by a
 * "Recent Posts" block whose one config row is the number of posts the source shows.
 * Works whether the matched element is the posts list itself or a container around it
 * (the catalog selector is the whole main column).
 */
export default function parse(element, { document }) {
  const posts = element.matches('.blog-posts') ? element : element.querySelector('.blog-posts');
  if (!posts) return;

  const count = posts.querySelectorAll('.post.hentry').length || 2;
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Recent Posts',
    cells: [['count', String(count)]],
  });
  posts.replaceWith(block);
}
