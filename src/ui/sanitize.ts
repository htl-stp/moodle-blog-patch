import DOMPurify from 'dompurify';

export const escapeHtml = (s: string) =>
	s.replace(
		/[&<>"']/g,
		(c) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
				c
			]!,
	);

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName === 'A') node.setAttribute('rel', 'noopener noreferrer');
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName !== 'IMG') return;

	const src = node.getAttribute('src') ?? '';
	if (!/^https:\/\//i.test(src)) {
		node.remove();
		return;
	}

	node.setAttribute('loading', 'lazy');
	node.setAttribute('decoding', 'async');
	node.setAttribute('referrerpolicy', 'no-referrer');
});

export function sanitizeHTML(html: string): string {
	const clean = DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'div',
			'span',
			'p',
			'br',
			'strong',
			'em',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'img',
			'a',
		],
		ALLOWED_ATTR: ['title', 'alt', 'src', 'href', 'rel'],
		ALLOW_DATA_ATTR: false,
	});

	const doc = new DOMParser().parseFromString(clean, 'text/html');

	doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
		const p = doc.createElement('p');
		const strong = doc.createElement('strong');
		strong.append(...h.childNodes);
		p.append(strong);
		h.replaceWith(p);
	});

	return doc.body.innerHTML;
}
