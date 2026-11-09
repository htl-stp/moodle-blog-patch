import { Post } from '../../domain/schemas';
import { escapeHtml, sanitizeHTML } from '../sanitize';
import { useEffect, useRef, useState } from 'preact/hooks';
import { openModal } from '../modal';
import { render } from 'preact';

function onContentClick(e: MouseEvent) {
	const target = e.target as Element;

	if (target instanceof HTMLImageElement) {
		e.preventDefault();
		void openModal({
			title: 'Image',
			body: `<img src="${escapeHtml(target.src)}" referrerpolicy="no-referrer" style="max-width:100%;">`,
		});
		return;
	}

	const link = (e.target as Element).closest('a');
	if (!link?.getAttribute('href')) return;

	e.preventDefault();

	const href = link.href; // absolute url

	void openModal({
		title: 'External Link',
		body: `<p>Are you sure you want to open this link? It redirects to:</p>
<p><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(href)}</a></p>`,
	});
}

export function BlogPost({ post }: { post: Post }) {
	const [expanded, setExpanded] = useState(false);
	const [showToggle, setShowToggle] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = contentRef.current;
		if (!element) return;

		setShowToggle(element.scrollHeight > element.clientHeight);
	}, [post.content]);

	const date = new Date(post.created).toLocaleString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});

	const showRaw = () => {
		void openModal({
			title: 'Raw Content',
			body: `<pre style="white-space: pre-wrap; word-break: break-word; margin: 0;">${escapeHtml(post.content)}</pre>`,
			large: true,
		});
	};

	return (
		<div class="forumpost blog_entry blog clearfix site">
			<div class="subject">{post.title}</div>

			<div class="author">
				by{' '}
				<a href={`https://moodle.htlstp.ac.at/user/view.php?id=${post.userid}`}>
					{post.authorName}
				</a>{' '}
				- {date}
			</div>

			<hr />

			<div
				ref={contentRef}
				class={`mb-content ${!expanded ? 'post-content' : ''}`}
				onClick={onContentClick}
				style={{ whiteSpace: 'pre-wrap' }}
				dangerouslySetInnerHTML={{
					__html: sanitizeHTML(post.content),
				}}
			/>

			{showToggle && (
				<a
					class={'tagmorelink'}
					onClick={(e) => {
						e.preventDefault();
						setExpanded(!expanded);
					}}
					href={'#'}
				>
					{expanded ? 'Show less' : 'Show more'}
				</a>
			)}

			<hr />

			<button onClick={showRaw}>Show Raw</button>
		</div>
	);
}
