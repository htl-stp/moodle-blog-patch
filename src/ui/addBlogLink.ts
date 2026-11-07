export function addBlogLink() {
	const tags = [...document.querySelectorAll('ul > li > p > a > span')].find(
		(el) => el.textContent.trim() === 'Tags',
	);

	const ul = tags?.closest('ul');

	if (!ul || ul.querySelector('#custom-blog-link')) {
		return false;
	}

	if (
		[...ul.querySelectorAll('ul > li > p > a > span')].find(
			(el) => el.textContent.trim() === 'Site blogs',
		)
	) {
		return true;
	}

	ul.insertAdjacentHTML(
		'beforeend',
		`
            <li class="type_setting depth_3 item_with_icon"
                role="treeitem" tabindex="-1"
                aria-selected="false" id="custom-blog-link">
                <p class="tree_item hasicon" tabindex="-1">
                    <a tabindex="-1" href="https://moodle.htlstp.ac.at/blog/index.php">
                        <i class="icon fa fa-square fa-fw navicon" aria-hidden="true"></i><span class="item-content-wrap">Site blogs</span>
                    </a>
                </p>
            </li>
        `,
	);

	return true;
}
