import { SubmitHook } from '../types';

export function modifyAddBlogPage(submitHook: SubmitHook) {
	return () => {
		const pageContent = document.getElementById('page-content');

		if (!pageContent) {
			return false;
		}

		pageContent.outerHTML = `
    <div id="page-content" class="pb-3 d-print-block">
                <div id="region-main-box">
                    <div id="region-main">

                        <span class="notifications" id="user-notifications"></span>
                        <div role="main"><span id="maincontent" tabindex="-1"></span><h2>Blogs: Add a new entry</h2>
                        
                        
                        
                        
<!-- Form Start -->
<form autocomplete="off" accept-charset="utf-8" id="moodle-neoblog-form" class="mform" data-boost-form-errors-enhanced="1">
\t<div style="display: none;"><input name="action" type="hidden" value="add">


</div>
<div class="collapsible-actions">
    <a id="collapsesections6adc5b4e494d46adc5b4e45edd5" href="#" aria-expanded="true" class="btn btn-link p-1 collapseexpand collapsemenu" role="button" aria-controls="collapseElement-0 collapseElement-1">
        <span class="collapseall">Collapse all</span>
        <span class="expandall">Expand all</span>
    </a>
</div>

\t<fieldset class="clearfix fitem collapsible" id="id_general" name="general"><legend class="visually-hidden">General</legend>
<div class="d-flex align-items-center mb-2">
    <div class="position-relative d-flex ftoggler align-items-center position-relative me-1">
            <a data-bs-toggle="collapse" href="#id_generalcontainer" role="button" aria-expanded="true" aria-controls="id_generalcontainer" class="btn btn-icon me-3 icons-collapse-expand stretched-link fheader " id="collapseElement-0">
                <span class="expanded-icon icon-no-margin p-2" title="Collapse">
                    <i class="icon fa fa-chevron-down fa-fw " aria-hidden="true"></i>
                </span>
                <span class="collapsed-icon icon-no-margin p-2" title="Expand">
                    <span class="dir-rtl-hide"><i class="icon fa fa-chevron-right fa-fw " aria-hidden="true"></i></span>
                    <span class="dir-ltr-hide"><i class="icon fa fa-chevron-left fa-fw " aria-hidden="true"></i></span>
                </span>
                <span class="visually-hidden">General</span>
            </a>
        <h3 class="d-flex align-self-stretch align-items-center mb-0" aria-hidden="true">
            General
        </h3>
    </div>
    
</div>
<div id="id_generalcontainer" class="fcontainer collapseable collapse  show"><div id="fitem_id_subject" class="mb-3 row  fitem    ">
    <div class="col-md-3 col-form-label d-flex pb-0 pe-md-0">
        
                <label id="id_subject_label" class="d-inline word-break " for="id_subject">
                    Entry title
                </label>
        
        <div class="form-label-addon d-flex align-items-center align-self-start">
                <div class="text-danger" title="Required" aria-hidden="true">
                    <i class="icon fa fa-circle-exclamation text-danger fa-fw " aria-hidden="true"></i>
                </div>
            
        </div>
    </div>
    <div class="col-md-9 d-flex flex-wrap align-items-start felement" data-fieldtype="text">
        <input type="text" class="form-control " name="subject" id="id_subject" value="" size="60" aria-required="true" maxlength="128">
        <div class="form-control-feedback invalid-feedback" id="id_error_subject">
            
        </div>
    </div>
</div><div id="fitem_id_summary_editor" class="mb-3 row  fitem    ">
    
    <div class="col-md-3 col-form-label d-flex pb-0 pe-md-0">
        
                <label id="id_summary_editor_label" class="d-inline word-break " for="id_summary_editor">
                    Blog entry body
                </label>
        
        <div class="form-label-addon d-flex align-items-center align-self-start">
                <div class="text-danger" title="Required" aria-hidden="true">
                    <i class="icon fa fa-circle-exclamation text-danger fa-fw " aria-hidden="true"></i>
                </div>
            
        </div>
    </div>
    
    <div class="col-md-9 d-flex flex-wrap align-items-start felement" data-fieldtype="editor">
        <div>
        
<div>
<textarea id="id_summary_editor" name="summary_editor[text]" class="form-control" rows="15" cols="80" spellcheck="true" data-fieldtype="editor"></textarea>



</div>


<div>
        <input name="summary_editor[format]" id="menusummary_editorformat" type="hidden" value="1">
</div><input type="hidden" name="summary_editor[itemid]" value="857991362"><noscript><div></div></noscript></div>
        <div class="form-control-feedback invalid-feedback" id="id_error_summary_editor">
            
        </div>
    </div>


</div>

\t\t</div>
</fieldset>
\t






<div id="fgroup_id_buttonar" class="mb-3 row  fitem femptylabel   " data-groupname="buttonar">
    <div class="col-md-3 col-form-label d-flex pb-0 pe-md-0">
        
        <div class="form-label-addon d-flex align-items-center align-self-start">
            
        </div>
    </div>
    <div class="col-md-9 d-flex flex-wrap align-items-start felement" data-fieldtype="group">
            <div class="w-100 m-0 p-0 border-0">
                <div class="d-flex flex-wrap align-items-center">
                    
                    <div class="mb-3  fitem  ">
                    
    <span data-fieldtype="submit">
        <input type="submit" class="btn btn-primary"
         name="submitbutton" id="id_submitbutton" value="Save changes">
    </span>
    
    
    <div class="form-control-feedback invalid-feedback" id="id_error_submitbutton">
        
    </div>
</div>
                     
                    <div class="mb-3  fitem   btn-cancel">
    <span data-fieldtype="submit">
        <input type="submit" class="btn
                        
                        btn-secondary
                    
                    " name="cancel" id="id_cancel" value="Cancel" data-skip-validation="1" data-cancel="1" onclick="skipClientValidation = true; return true;">
    </span>
    <div class="form-control-feedback invalid-feedback" id="id_error_cancel">
        
    </div>
</div>
                </div>
            </div>
        <div class="form-control-feedback invalid-feedback" id="fgroup_id_error_buttonar">
            
        </div>
    </div>
</div>
\t\t<div class="fdescription required" aria-hidden="true"><i class="icon fa fa-circle-exclamation text-danger fa-fw " aria-hidden="true" title="Required field"></i> Required</div>
</form>





<script>var skipClientValidation = false;</script></div>
                        
                        

                    </div>
                </div>
            </div>
    `;

		const form = document.getElementById('moodle-neoblog-form');

		if (!form) {
			return false;
		}

		form.addEventListener('submit', (e) => {
			e.preventDefault();

			const formData = new FormData(form as HTMLFormElement);

			const data = Object.fromEntries(formData.entries());

			console.log(data);

			const title = formData.get('subject');
			const description = formData.get('summary_editor[text]');

			if (
				!title ||
				String(title).length === 0 ||
				!description ||
				String(description).length === 0
			) {
				console.error('missing params');
				alert('Missing fields!');
				return;
			}

			submitHook(String(title), String(description));
		});

		return true;
	};
}
