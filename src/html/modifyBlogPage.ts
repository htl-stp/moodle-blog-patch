import { FetchedPost } from '../types';
import { BlogPost } from './BlogPost';

export function modifyBlogPage(posts: FetchedPost[], newVersion: boolean) {
	console.log(`modified blog page with ${posts.length} posts`);

	return () => {
		const pageContent = document.getElementById('page-content');

		if (!pageContent) {
			return false;
		}

		pageContent.outerHTML = `
        <div id="page-content" class="d-flex flex-wrap  blocks-pre   d-print-block">
            <div id="region-main-box" class="region-main">
                <div id="region-main" class="region-main-content">
                    <span class="notifications" id="user-notifications"></span>
                    <div role="main"><span id="maincontent"></span><h2>Site blog ${newVersion ? "<a href='https://github.com/htl-stp/moodle-blog-patch' style='font-size: 0.6em;'>(New Version available!)</a>" : ""}</h2><nav aria-label="Page" class="pagination pagination-centered justify-content-center">
        <!--
        <ul class="mt-1 pagination flex-wrap justify-content-center" data-page-size="10">
                <li class="page-item" data-page-number="2">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=1" class="page-link">
                        <span aria-hidden="true">«</span>
                        <span class="visually-hidden">Previous page</span>
                    </a>
                </li>
                
                <li class="page-item " data-page-number="1">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=0" class="page-link">
                        <span aria-hidden="true">1</span>
                        <span class="visually-hidden">Page 1</span>
                    </a>
                </li>
                
                <li class="page-item " data-page-number="2">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=1" class="page-link">
                        <span aria-hidden="true">2</span>
                        <span class="visually-hidden">Page 2</span>
                    </a>
                </li>
                
                <li class="page-item active" data-page-number="3">
                    <a href="#" class="page-link" aria-current="page">
                        <span aria-hidden="true">3</span>
                        <span class="visually-hidden">Page 3</span>
                    </a>
                </li>
                
                <li class="page-item " data-page-number="4">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=3" class="page-link">
                        <span aria-hidden="true">4</span>
                        <span class="visually-hidden">Page 4</span>
                    </a>
                </li>
                
                <li class="page-item" data-page-number="4">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=3" class="page-link">
                        <span aria-hidden="true">»</span>
                        <span class="visually-hidden">Next page</span>
                    </a>
                </li>
        </ul>
        -->
    </nav>
    <div class="addbloglink"><a href="https://moodle.htlstp.ac.at/blog/edit.php?action=add">Add a new entry</a></div>
   
${posts.map((post) => BlogPost(post).outerHTML).join('')}

    
    
    
<nav aria-label="Page" class="pagination pagination-centered justify-content-center">
        <!--
        <ul class="mt-1 pagination flex-wrap justify-content-center" data-page-size="10">
                <li class="page-item" data-page-number="2">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=1" class="page-link">
                        <span aria-hidden="true">«</span>
                        <span class="visually-hidden">Previous page</span>
                    </a>
                </li>
                <li class="page-item " data-page-number="1">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=0" class="page-link">
                        <span aria-hidden="true">1</span>
                        <span class="visually-hidden">Page 1</span>
                    </a>
                </li>
                <li class="page-item " data-page-number="2">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=1" class="page-link">
                        <span aria-hidden="true">2</span>
                        <span class="visually-hidden">Page 2</span>
                    </a>
                </li>
                <li class="page-item active" data-page-number="3">
                    <a href="#" class="page-link" aria-current="page">
                        <span aria-hidden="true">3</span>
                        <span class="visually-hidden">Page 3</span>
                    </a>
                </li>
                <li class="page-item " data-page-number="4">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=3" class="page-link">
                        <span aria-hidden="true">4</span>
                        <span class="visually-hidden">Page 4</span>
                    </a>
                </li>
                <li class="page-item" data-page-number="4">
                    <a href="https://moodle.htlstp.ac.at/blog/index.php?blogpage=3" class="page-link">
                        <span aria-hidden="true">»</span>
                        <span class="visually-hidden">Next page</span>
                    </a>
                </li>
        </ul>
        -->
    </nav><br>&nbsp;&nbsp;<br>
<style>[data-bs-theme=dark]{--bs-primary:#0d6efd!important;--color_primary:#0d6efd!important;--bs-white:#fff!important;--bs-white-rgb:255,255,255!important;--bs-gray-100:#f8f9fa!important;--bs-gray-100-rgb:248,249,250!important;--bs-gray-200:#e9ecef!important;--bs-gray-200-rgb:233,236,239!important;--bs-gray-300:#dee2e6!important;--bs-gray-300-rgb:222,226,230!important;--bs-gray-400:#ced4da!important;--bs-gray-400-rgb:206,212,218!important;--bs-gray-500:#adb5bd!important;--bs-gray-500-rgb:173,181,189!important;--bs-gray-600:#6c757d!important;--bs-gray-600-rgb:108,117,125!important;--bs-gray-700:#495057!important;--bs-gray-700-rgb:73,80,87!important;--bs-gray-800:#393e4f!important;--bs-gray-800-rgb:57,62,79!important;--bs-gray-900:#2e3134!important;--bs-gray-900-rgb:46,49,52!important;--bs-gray-1000:#1e1e25!important;--bs-gray-1000-rgb:30,30,37!important;--bs-gray-1100:#0e0e11!important;--bs-gray-1100-rgb:14,14,17!important;--bs-black:#000!important;--bs-black-rgb:0,0,0!important;--bs-nav-drawer:#e8eaed!important;--bs-nav-drawer-rgb:232,234,237!important;--bs-link-color:#98b6d9!important;--bs-link-color-rgb:152,182,217!important;--bs-link-hover-color:#aacbf2!important;--bs-link-hover-color-rgb:170,203,242!important;--bs-link-focus-color:#b3c0e8!important;--bs-link-focus-color-rgb:179,192,232!important;--bs-text-color:#cbd0d4!important;--bs-text-color-rgb:203,208,212!important;}[data-bs-theme=dark].filemanager.fp-thumbnailimg[src*="/core/"][src*="/f/"],[data-bs-theme=dark].filemanager.fp-iconimg[src*="/core/"][src*="/f/"],[data-bs-theme=dark].filemanager.fp-thumbnailimg[src*="component=core"][src*="image=f%2f"i],[data-bs-theme=dark].filemanager.fp-iconimg[src*="component=core"][src*="image=f%2f"i]{filter:invert(1);}</style></div>
                    
                    
                </div>
            </div>
            <div class="columnleft blockcolumn  has-blocks ">
                <div data-region="blocks-column" class="d-print-none">
                    <aside id="block-region-side-pre" class="block-region" data-blockregion="side-pre" data-droptarget="1" aria-labelledby="side-pre-block-region-heading"><h2 class="visually-hidden" id="side-pre-block-region-heading">Blocks</h2><a href="#sb-1" class="visually-hidden-focusable">Skip Navigation</a>

<section id="inst23" class=" block_navigation block  card mb-3" role="navigation" data-block="navigation" data-instance-id="23" aria-labelledby="instance-23-header">

    <div class="card-body p-3">

        <div class="d-flex">
                <h3 id="instance-23-header" class="h5 card-title">Navigation</h3>

        </div>

        <div class="card-text content mt-3">
<ul class="block_tree list" role="tree" data-ajax-loader="block_navigation/nav_loader">
    <li class="type_unknown depth_1 contains_branch" role="treeitem" aria-expanded="true" aria-owns="random6adb1cc32f6412_group" data-collapsible="false" aria-labelledby="random6adb1cc32f6411_label_1_1" tabindex="0" aria-selected="true">
        <p class="tree_item branch navigation_node" tabindex="-1">
            <a tabindex="-1" id="random6adb1cc32f6411_label_1_1" href="https://moodle.htlstp.ac.at/my/courses.php">My courses</a>
        </p>
        
        <ul id="random6adb1cc32f6412_group" role="group" tabindex="-1">
            <li class="type_setting depth_2 item_with_icon" role="treeitem" aria-labelledby="random6adb1cc32f6413_label_2_2" tabindex="-1" aria-selected="false">
                <p class="tree_item hasicon" tabindex="-1">
                    <a tabindex="-1" id="random6adb1cc32f6413_label_2_2" href="https://moodle.htlstp.ac.at/">
                        <i class="icon fa fa-house fa-fw navicon" aria-hidden="true" tabindex="-1"></i>
                        <span class="item-content-wrap" tabindex="-1">Site home</span>
                    </a>
                </p>
            </li>
            
            <li class="type_course depth_2 contains_branch" role="treeitem" aria-expanded="true" aria-owns="random6adb1cc32f6415_group" aria-labelledby="random6adb1cc32f6413_label_2_3" tabindex="-1" aria-selected="false">
                <p class="tree_item branch" tabindex="-1"><span tabindex="-1" id="random6adb1cc32f6413_label_2_3" title="Abteilung Informatik">Site pages</span></p>
                
                <ul id="random6adb1cc32f6415_group" role="group" tabindex="-1">
                    <li class="type_custom depth_3 item_with_icon" role="treeitem" aria-labelledby="random6adb1cc32f6416_label_3_5" tabindex="-1" aria-selected="false"><p class="tree_item hasicon" tabindex="-1"><a tabindex="-1" id="random6adb1cc32f6416_label_3_5" href="https://moodle.htlstp.ac.at/my/courses.php"><i class="icon fa fa-square fa-fw navicon" aria-hidden="true" tabindex="-1"></i><span class="item-content-wrap" tabindex="-1">My courses</span></a></p></li>
                    <li class="type_unknown depth_3 item_with_icon current_branch" role="treeitem" aria-labelledby="random6adb1cc32f6416_label_3_6" tabindex="-1" aria-selected="false"><p class="tree_item hasicon active_tree_node" tabindex="-1"><a tabindex="-1" id="random6adb1cc32f6416_label_3_6" href="https://moodle.htlstp.ac.at/blog/index.php"><i class="icon fa fa-square fa-fw navicon" aria-hidden="true" tabindex="-1"></i><span class="item-content-wrap" tabindex="-1">Site blogs</span></a></p></li>
                    <li class="type_custom depth_3 item_with_icon" role="treeitem" aria-labelledby="random6adb1cc32f6416_label_3_7" tabindex="-1" aria-selected="false"><p class="tree_item hasicon" tabindex="-1"><a tabindex="-1" id="random6adb1cc32f6416_label_3_7" href="https://moodle.htlstp.ac.at/badges/index.php?type=1"><i class="icon fa fa-square fa-fw navicon" aria-hidden="true" tabindex="-1"></i><span class="item-content-wrap" tabindex="-1">Site badges</span></a></p></li>
                    <li class="type_setting depth_3 item_with_icon" role="treeitem" aria-labelledby="random6adb1cc32f6416_label_3_8" tabindex="-1" aria-selected="false"><p class="tree_item hasicon" tabindex="-1"><a tabindex="-1" id="random6adb1cc32f6416_label_3_8" href="https://moodle.htlstp.ac.at/tag/search.php"><i class="icon fa fa-square fa-fw navicon" aria-hidden="true" tabindex="-1"></i><span class="item-content-wrap" tabindex="-1">Tags</span></a></p></li>
                </ul>
            
            </li>
            

        </ul>
    
    </li>
</ul>
<div class="footer"></div>
        </div>

    </div>

</section>

  <span id="sb-1"></span></aside>
                </div>
            </div>

            <div class="columnright blockcolumn ">
                <div data-region="blocks-column" class="d-print-none">
                    <aside id="block-region-side-post" class="block-region" data-blockregion="side-post" data-droptarget="1" aria-labelledby="side-post-block-region-heading"><h2 class="visually-hidden" id="side-post-block-region-heading">Supplementary blocks</h2></aside>
                </div>
            </div>
        </div>
        `;
		return true;
	};
}
