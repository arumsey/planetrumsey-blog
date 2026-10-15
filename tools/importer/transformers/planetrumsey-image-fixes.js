/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: recovered photos for posts whose Blogger images were temporary Google Drive
 * preview links (lh3.googleusercontent.com/drive-viewer/...), which now return 403.
 * The originals live in the author's shared Drive folder "BlogTouch iPad Pictures"; each dead
 * link (keyed by the first 40 characters of its drive-viewer token) maps to the Drive file
 * uploaded for that spot, matched by upload order and content.
 * Affects 2023/04/nashville-with-two-teenagers (28) and 2023/06/get-ready-to-travel-with-me (3).
 */
const TransformHook = { beforeTransform: 'beforeTransform' };

const RECOVERED_DRIVE_FILES = {
  'AFGJ81paTts0h2C5lnY8V_bsmFZ3ASDK6Nr-kgkT': '1IOE93nAYqGrclq8AU-55mhoXnlg5Ei3U',
  'AFGJ81oTocA-EJC1jOSTV2uQd-WIPwWcGITVqM51': '11SVC6OYywQ5-mbhd4sQ6eWnXu6ivAXiU',
  'AFGJ81pW4yfTEDNt65qi8c0yvKiwXZdZ5N_KGVGA': '1iZMhmREIIh2J822gDNDj_3nqE9hfex5P',
  'AFGJ81rzIKxHjdCXCkED95e_0MY8Gt_-ObB78wCq': '1v3-pVbfXrekz0vgDjqP3lzHXDlGbtrcF',
  'AFGJ81rhuVwkDcPMqonMQmP0WkdoTIkx5dFoxU-v': '1fSgAfYpjVckS2argetpwK40Pz8IL6y-f',
  'AFGJ81ryEis3CTLuwmRLBdud24K7u3s3D2jDvqds': '1a8lJVfZTbYQo0un_TI8QSrW4shtR4w7_',
  'AFGJ81pKhnWUrLiJatvv_ji4d4D0ZAPrkxowDnaA': '1NI8vQD8b-VFjABPZoC35zXJ_alyxudd5',
  'AFGJ81pBvbaVM5zqljgMfWL0qkRg68IeNzP2WHpA': '1QLAMqz-lwarR_CTuleEsQowbX6Q1Rds3',
  'AFGJ81ozBJtnEK9SgjsfcxwM8b1fsLKT13bg3JJv': '1caCRf2I2udJTL-joEgVRkF21xFqOfDBP',
  'AFGJ81pJgaXbbjJC8mIFFbeyh-K2CWwU7lrKINc4': '1GmezbWwRX8ykVCzgot75Sfbn9aLBcPeo',
  'AFGJ81pM0aLr_2Q8JDbC_XTbrDmrNWuaqzoqeUAq': '13vvu4DYmvKEldWFSSrC2DbBIle1-gq1n',
  'AFGJ81omAbqiunTiKDQgPM-FWV8lQ-u9g1IIUQYr': '1aXF-g3Ucu7duJws6qNXtkTeBfYVS7QV4',
  'AFGJ81pvDPNi7EZ9AV14mcJhPORlXu4gAfUKhxga': '1feXZlt7S2P_Cuhz1uqbbG_HTEQQeFaNg',
  'AFGJ81q145sviqRpVDCRvwm3he9mM8NCXwCBKQcB': '1eWVM1wBq91sjwgs791yj9X0CPKb_Z9fn',
  'AFGJ81qjOwo1qEEtsCEzzVXjBaxogjNcSz-9Ns3K': '10KMt1nJRBxw_fMj_eQpUsSQhm8pWExfO',
  'AFGJ81oMgD2lkk0vQUhtJTzaV5YfXZzTRWlgu2Jv': '1pd4CHAZQcuPjHg7JHwiZS6Z8uieeP8Vm',
  'AFGJ81qeqV-9JGxy1myX7eLw4FwpRpdmqONCoU4J': '1Vi8MvBS51vW4Fq5nSN0mpjzhsqdUqvz0',
  'AFGJ81q_U7d1rpSvhyaVYhiw5Gzvigec0W65pol0': '1dWzwTcH4e9YKHTjvUXqAk_7cnRrePajk',
  'AFGJ81qBRWIXf6n5Y9WIlRtVHqQrA2EWZCVMdWqv': '1avv9DMkinqRoJQr4ONURX8I3SXw_Vu5o',
  'AFGJ81pHqIBF8l6PkWaGkBJ0B9Zb4Xvuy9WBDSgN': '1AeK_CcyHAeeuPOGQQEG16DF7J5wk3UDF',
  'AFGJ81ojnQi3C5VrWmgBsC1C00v1qaASDqhOV3RV': '1wjmAdA11oVb7EkbFTXZuErKSYXD0-5IM',
  'AFGJ81qO1dfGaJzp5MqRJklrHrLyc9T9cs97z-YP': '1hUpA0AjIqDBXa0twOXhX8n_7bzxSSHmu',
  'AFGJ81pIknZTZmLiDAVtMnh3siIO8jtAzrkzhU-8': '1xsMxEvAiO5c0vpdpm2Py_7gpteauIslx',
  'AFGJ81pw2Ns_UvT1HDjEzB-THqyammzCb3FJLpYW': '1m5Q9XXLaxMVCH4-wH65tXd_IY3KV0HfV',
  'AFGJ81rQoxu4ARcizuNiH1A8ZSh1WzNgjPnB7EOc': '1AuBxESg65E_nAp1g2iiALIT9CmPs43Qr',
  'AFGJ81rxtIIIGSYHbmHhjDpT8Z5ZNO1hv5N6ZoGc': '1HJXCxp_OodnfALZlto-1f7UeJFhBedzA',
  'AFGJ81qfSpP4qLXWWDmHXf8vEazxXKhjrMfsr7kT': '1hs0oRA5NoWmElc6otjnXS6R7kvfs5bdL',
  'AFGJ81qF4Wkc1f2NYDPrRQ_hSVwMR5jIeYFL1nuv': '1luMNj1V1G5Zzl77wXHmtDYztvlBC2Kwr',
  'AFGJ81qfAhHB_cyU5C3imv-fWxSat8fSImMJuxaD': '17Dat6CS5m3wMhQXV3Ap7zu1apjsy1GHl',
  'AFGJ81r34EN3wiQ9npL9948GH3W3N_qdi08Wg13P': '1_MeWXz0pVLOy9Jq13GGpjH9Ht93mqvoC',
  'AFGJ81oG_e6sjurmn0ASfU3wz9G1bAxXn2XDynJd': '1D7jdweriCGVtSrhBJrJbRt93vPolcUx3'
};

const driveImage = (fileId) => `https://lh3.googleusercontent.com/d/${fileId}=w1600`;

const recoveredFor = (url) => {
  const token = (url || '').match(/drive-viewer\/([A-Za-z0-9_-]{40})/);
  return token ? RECOVERED_DRIVE_FILES[token[1]] : null;
};

/*
 * Full-size Blogger photos: older posts (e.g. the 2019 British Invasion series) show s320
 * thumbnails wrapped in a link to the s1600 original. Import the original instead of the thumbnail.
 */
const BLOGGER_IMAGE = /^https?:\/\/(blogger\.googleusercontent\.com\/img\/|\d+\.bp\.blogspot\.com\/)/;
const SIZED_PATH = /\/(s|w)\d+(-[a-z0-9-]+)?\//;

const fullSizeFor = (img) => {
  const src = img.getAttribute('src') || '';
  if (!BLOGGER_IMAGE.test(src) || !SIZED_PATH.test(src)) return null;
  const href = img.closest('a[href]')?.getAttribute('href') || '';
  // the link must point at the same photo (same file name), not at another page or image
  const file = (u) => u.split('/').pop();
  if (BLOGGER_IMAGE.test(href) && file(href) === file(src)) return href;
  return null;
};

export default function transform(hookName, element, payload) { // eslint-disable-line no-unused-vars
  if (hookName !== TransformHook.beforeTransform) return;
  element.querySelectorAll('img[src]').forEach((img) => {
    const full = fullSizeFor(img);
    if (!full) return;
    img.setAttribute('src', full);
    img.removeAttribute('srcset');
  });
  element.querySelectorAll('img[src*="/drive-viewer/"]').forEach((img) => {
    const fileId = recoveredFor(img.getAttribute('src'));
    if (!fileId) return;
    img.setAttribute('src', driveImage(fileId));
    img.removeAttribute('srcset');
    const link = img.closest('a[href*="/drive-viewer/"]');
    if (link) link.setAttribute('href', driveImage(fileId));
  });
}
