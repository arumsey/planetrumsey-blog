/**
 * Fetches the nav fragment: the site root on published sites, /content on local preview.
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's sections
 */
async function fetchNav() {
  // local preview serves fragments under /content; published sites at the root
  const paths = ['/content/nav.plain.html', '/nav.plain.html'];
  if (window.location.hostname !== 'localhost') paths.reverse();
  let resp = await fetch(paths[0]);
  if (!resp.ok) resp = await fetch(paths[1]);
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  return wrapper;
}

/**
 * loads and decorates the header: site title (first section) and tagline (second section)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Site');

  const classes = ['brand', 'description'];
  [...fragment.children].forEach((section, i) => {
    if (!section.textContent.trim() && !section.querySelector('img')) return;
    section.classList.add(`nav-${classes[i] || `section-${i + 1}`}`);
    nav.append(section);
  });

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) brandLink.setAttribute('aria-label', `${brandLink.textContent.trim()} home`);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
