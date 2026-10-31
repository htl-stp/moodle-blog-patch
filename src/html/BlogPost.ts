import { FetchedPost } from '../types';
import {escapeHtml, sanitizeHTML} from '../html';

export function BlogPost(post: FetchedPost) {
	const title = post.title;
	const authorId = post.authorId;
	const author = post.author;
	const content = post.content;
	const date = new Date(post.created).toLocaleString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
	const initials = post.author
		.split(' ')
		.map((p) => p[0])
		.join('');


	const doc = new DOMParser().parseFromString(sanitizeHTML(content), 'text/html');

	doc.querySelectorAll("img").forEach((img) => {
		img.style.maxWidth = "50%";
		img.style.maxHeight = "60%";
	});

	const sanitizedContent = doc.body.innerHTML;


	const html = `
        <div id="b22" class="forumpost blog_entry blog clearfix site">
    <div class="row header clearfix">
        <div class="left picture header">
            <a href="https://moodle.htlstp.ac.at/user/profile.php?id=${authorId}" class="d-inline-block aabtn">
                <span class="userinitials size-35" title="${escapeHtml(author)}" aria-label="${escapeHtml(author)}" role="img">
                ${escapeHtml(initials)}
                </span>
            </a>
        </div>
        <div class="topic starter header clearfix">
            <div class="subject">
                <a href="https://moodle.htlstp.ac.at/blog/index.php">
                    ${escapeHtml(title)}
                </a>
            </div>
            <div class="author">
                by
                <a href="https://moodle.htlstp.ac.at/user/view.php?id=${authorId}">${escapeHtml(author)}</a>
                - ${date}
            </div>
            `
		+
		(post.badge ? `
            <div>
            	<div style="
					background-color: ${post.badge.backgroundColor}; 
					color: ${post.badge.color}; 
					border-radius: 10px;
					padding: 2px 4px;
					display: inline-block;
            	">
            		${escapeHtml(post.badge.text)}
				</div>
			</div>
		` : '')
		+
`
        </div>
    </div>
    <div class="row maincontent clearfix">
        <div class="no-overflow content ">
            <div class="audience">
                Anyone on this site
            </div>
            
            
            <div class="no-overflow" style="white-space: pre-wrap;">${sanitizedContent}</div>
            
            
            <div class="commands"><a href="https://moodle.htlstp.ac.at/blog/index.php">Permalink</a></div>
            <div style="display:none" id="cmt-tmpl">
                <div class="comment-message">
                    <div class="comment-message-meta me-3"><span class="picture">___picture___</span><span
                            class="user fw-bold">___name___</span> - <span class="time">___time___</span></div>
                    <div class="text">___content___</div>
                </div>
            </div>
            
            <!--
            <div class="mdl-left"><a class="showcommentsnonjs"
                                     href="https://moodle.htlstp.ac.at/blog/index.php?nonjscomment=1&amp;comment_itemid=22&amp;commentcontext=31&amp;comment_component=blog&amp;comment_area=format_blog">Show
                comments</a><a class="comment-link" id="comment-link-6adb1cc336ace" href="#" role="button"
                               aria-expanded="false"><img id="comment-img-6adb1cc336ace" class="icon"
                                                          src="https://moodle.htlstp.ac.at/theme/image.php/classic/core/1792433132/t/collapsed"
                                                          alt="Comments"><span id="comment-link-text-6adb1cc336ace">Comments (<span
                    class="comment-link-count">0</span>)</span></a>
                <div id="comment-ctrl-6adb1cc336ace" class="comment-ctrl">
                    <ul id="comment-list-6adb1cc336ace" class="comment-list">
                        <li class="first"></li>
                    </ul>
                    <div id="comment-pagination-6adb1cc336ace" class="comment-pagination"></div>
                    <div class="comment-area">
                        <div class="db"><label for="dlg-content-6adb1cc336ace"
                                               class="visually-hidden">Comment</label><textarea name="content" rows="2"
                                                                                                id="dlg-content-6adb1cc336ace"
                                                                                                aria-label="Add a comment..."
                                                                                                placeholder="Add a comment..."
                                                                                                cols="20"></textarea>
                        </div>
                        <div class="fd mt-1" id="comment-action-6adb1cc336ace"><a id="comment-action-post-6adb1cc336ace"
                                                                                  href="#">Save comment</a></div>
                    </div>
                    <div class="clearer"></div>
                </div>
            </div>
            -->
            
        </div>
        <!-- <div class="side options">&nbsp;</div> -->
    </div>
</div>
    `;

	const template = document.createElement('template');
	template.innerHTML = html.trim();

	return template.content.firstElementChild!;
}
