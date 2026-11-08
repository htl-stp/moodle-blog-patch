import {Post} from '../../domain/schemas';
import {BlogPost} from '../components/BlogPost';

export function setPageShell() {

    const pageContent = document.getElementById('page-content');

    if (!pageContent) {
        return;
    }

    pageContent.outerHTML = `
        <div id="page-content" class="d-flex flex-wrap  blocks-pre   d-print-block">
            <div id="region-main-box" class="region-main">
                <div id="region-main" class="region-main-content">
                    <span class="notifications" id="user-notifications"></span>
                    <div role="main"></div>
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
}
