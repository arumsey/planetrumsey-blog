/**
 * Fetches a fragment's markup: the site root on published sites, /content on local preview.
 * @param {string} path fragment path, e.g. /nav
 * @returns {Promise<HTMLElement|null>} wrapper holding the fragment's sections
 */
async function fetchFragment(path) {
  const paths = [`/content${path}.plain.html`, `${path}.plain.html`];
  if (window.location.hostname !== 'localhost') paths.reverse();
  let resp = await fetch(paths[0]);
  if (!resp.ok) resp = await fetch(paths[1]);
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  return wrapper;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Builds an inline SVG from a list of [tag, attributes] children.
 * @param {string} viewBox the viewBox
 * @param {string} className class for the svg
 * @param {Array} children [tag, attrs] pairs
 * @returns {SVGElement} decorative svg
 */
function svg(viewBox, className, children) {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('class', className);
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  children.forEach(([tag, attrs]) => {
    const child = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => child.setAttribute(k, v));
    el.append(child);
  });
  return el;
}

/* the route: a dotted line from a start dot to a pin, after the trip route maps on the blog */
const route = () => svg('0 0 352 28', 'nav-route', [
  ['circle', {
    cx: 6, cy: 20, r: 4.5, fill: 'currentColor',
  }],
  ['path', {
    d: 'M14 20 C 70 2, 110 2, 150 14 S 240 30, 290 12 S 330 4, 340 10', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-dasharray': '2 7',
  }],
  ['path', { d: 'M340 2.5 a6 6 0 0 1 6 6 c0 4.5-6 10.5-6 10.5 s-6-6-6-10.5 a6 6 0 0 1 6-6z', fill: 'currentColor' }],
]);

const instagramIcon = () => svg('0 0 24 24', 'nav-social-icon', [
  ['rect', {
    x: 3, y: 3, width: 18, height: 18, rx: 5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8,
  }],
  ['circle', {
    cx: 12, cy: 12, r: 4.2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8,
  }],
  ['circle', {
    cx: 17.4, cy: 6.6, r: 1.1, fill: 'currentColor',
  }],
]);

/**
 * Wordmark: the site name with its second half in bold, "planet" + "rumsey".
 * Names that don't start with "planet" are shown as authored.
 * @param {HTMLAnchorElement} link the brand link
 */
function decorateWordmark(link) {
  const name = link.textContent.trim();
  const match = name.match(/^(planet)(.+)$/i);
  link.setAttribute('aria-label', `${name} home`);
  if (!match) return;
  const [, light, heavy] = match;
  const bold = document.createElement('b');
  bold.textContent = heavy;
  link.replaceChildren(light, bold);
}

/**
 * Social links from the shared sidebar fragment (its first list of image links).
 * @returns {Promise<HTMLUListElement|null>} list of icon links
 */
async function buildSocial() {
  const fragment = await fetchFragment('/fragments/sidebar');
  const list = fragment && [...fragment.querySelectorAll('ul')]
    .find((ul) => ul.querySelector('a img'));
  if (!list) return null;
  const ul = document.createElement('ul');
  ul.className = 'nav-social';
  list.querySelectorAll('a[href]').forEach((a) => {
    const { hostname } = new URL(a.href, window.location.href);
    const service = hostname.replace(/^www\./, '').split('.')[0];
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.href;
    link.setAttribute('aria-label', `planetrumsey on ${service.charAt(0).toUpperCase()}${service.slice(1)}`);
    if (service === 'instagram') {
      link.append(instagramIcon());
    } else {
      const img = a.querySelector('img');
      img.removeAttribute('loading');
      link.append(img);
    }
    li.append(link);
    ul.append(li);
  });
  return ul;
}

/**
 * loads and decorates the header: wordmark (first nav section), route, tagline (second
 * section) and the social links
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const [fragment, social] = await Promise.all([fetchFragment('/nav'), buildSocial()]);
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

  const brand = nav.querySelector('.nav-brand');
  const brandLink = brand?.querySelector('a');
  if (brandLink) decorateWordmark(brandLink);
  if (brand) brand.after(route());
  if (social) nav.append(social);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
