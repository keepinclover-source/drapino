/**
 * Sanitizes HTML strings using DOMParser and strict node/attribute allowlisting
 * to prevent DOM-based Cross-Site Scripting (XSS) attacks.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'span', 'div', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);

const ALLOWED_ATTRS = new Set(['class', 'style', 'title', 'alt', 'width', 'height']);

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;

  // Check if URL specifies a scheme/protocol (e.g. javascript:, data:, http://)
  const schemeMatch = trimmed.match(/^([a-z0-9+.-]+):/i);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    return scheme === 'http' || scheme === 'https' || scheme === 'mailto' || scheme === 'tel';
  }

  // Relative URLs without explicit scheme (e.g. /path, ./path, images/foo.png) are safe
  return true;
}

function cleanNode(node: Node): void {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        element.remove();
        continue;
      }

      // Remove event handlers and non-allowlisted attributes
      const attrNames = element.getAttributeNames();
      for (const attr of attrNames) {
        const lowerAttr = attr.toLowerCase();
        if (lowerAttr.startsWith('on')) {
          element.removeAttribute(attr);
          continue;
        }

        if (tagName === 'a' && lowerAttr === 'href') {
          const val = element.getAttribute(attr) || '';
          if (!isSafeUrl(val)) {
            element.setAttribute('href', '#');
          }
          continue;
        }

        if (tagName === 'img' && lowerAttr === 'src') {
          const val = element.getAttribute(attr) || '';
          if (!isSafeUrl(val)) {
            element.removeAttribute('src');
          }
          continue;
        }

        if (!ALLOWED_ATTRS.has(lowerAttr)) {
          element.removeAttribute(attr);
        }
      }

      cleanNode(element);
    } else if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
      child.remove();
    }
  }
}

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return dirtyHtml.replace(/<[^>]*>/g, '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirtyHtml, 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML;
}
