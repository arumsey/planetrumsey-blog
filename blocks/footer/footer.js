/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
