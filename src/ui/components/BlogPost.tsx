import {Post, SignedPost} from "../../domain/schemas";
import {sanitizeHTML} from "../sanitize";
import {useEffect, useRef, useState} from "preact/hooks";

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
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });

    return (
        <div class="forumpost blog_entry blog clearfix site">
            <div class="subject">{post.title}</div>

            <div class="author">
                by <a href={`https://moodle.htlstp.ac.at/user/view.php?id=${post.userid}`}>
                {post.authorName}
            </a> - {date}
            </div>

            <hr />

            <div
                ref={contentRef}
                class={`mb-content ${!expanded ? 'post-content' : ''}`}
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(post.content)
                }}
            />

            {showToggle && (
                <a onClick={(e) => {
                    e.preventDefault();
                    setExpanded(!expanded)
                }} href={'#'}>
                    {expanded ? 'Show less' : 'Show more'}
                </a>
            )}

            <style>
                {`
                .post-content {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 7;
                    overflow: hidden;
                }`}
            </style>
        </div>
    );
}