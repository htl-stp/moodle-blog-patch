import { useEffect, useState } from 'preact/hooks';
import { Post } from '../domain/schemas';
import { FeedService } from '../services/FeedService';
import { BlogPost } from './components/BlogPost';
import { render } from 'preact';

export function BlogPage() {
	const [posts, setPosts] = useState<Post[] | null>(null);

	useEffect(() => {
		FeedService.getFeed().then(setPosts);
	}, []);

	return (
		<div>
			<h2>Site blog</h2>
			<div class="addbloglink">
				<a href="https://moodle.htlstp.ac.at/blog/edit.php?action=add">
					Add a new entry
				</a>
			</div>
			{posts === null ? (
				<p>Loading posts...</p>
			) : (
				posts.map((p) => <BlogPost key={`${p.userid}:${p.id}`} post={p} />)
			)}

			<style>
				{`
                .post-content {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 7;
                    overflow: hidden;
                }
                
                .mb-content img {
					max-width: min(100%, 480px);
					max-height: 60vh;
					height: auto;
					object-fit: contain;
					cursor: zoom-in;
				}`}
			</style>
		</div>
	);
}

export function mountBlogPage(target: Element) {
	render(<BlogPage />, target);
}
