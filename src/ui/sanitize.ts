import DOMPurify from 'dompurify';

export function escapeHtml(text: string): string {
	const el = document.createElement('div');
	el.textContent = text;
	return el.innerHTML;
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
