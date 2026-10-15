/**
 * Fetches the footer fragment: the site root on published sites, /content on local preview.
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's sections
 */
async function fetchFooter() {
  // local preview serves fragments under /content; published sites at the root
  const paths = ['/content/footer.plain.html', '/footer.plain.html'];
  if (window.location.hostname !== 'localhost') paths.reverse();
  let resp = await fetch(paths[0]);
  if (!resp.ok) resp = await fetch(paths[1]);
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  return wrapper;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-content';
  [...fragment.children].forEach((section) => {
    section.classList.add('footer-section');
    footer.append(section);
  });

  // links to other sites open in a new tab, as on the source footer
  footer.querySelectorAll('a[href]').forEach((a) => {
    const { origin } = new URL(a.href, window.location.href);
    if (origin !== window.location.origin) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });

  block.append(footer);
}
