import DOMPurify from 'dompurify';

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function sanitizeHTML(html: string): string {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'div',
			'span',
			'p',
			'br',
			'hr',
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
}
