import {SubmitHook} from '../types';
import {MoodleModal, openModal} from "../modals";

let modal: Promise<MoodleModal>;

export function modifyAddBlogPage(submitHook: SubmitHook) {
    return () => {
        const pageContent = document.getElementById('page-content');

        if (!pageContent) {
            return false;
        }


        if (!modal) {
            modal = openModal({
                title: "Add Post",
                body:
                    `<form id="post-add-form">
	<div class="form-set">
		<label for="post-title">Title</label>
		<input type="text" id="post-title" name="title">
	</div>
	
	<div class="form-set">
		<label for="post-content">Content</label>
		<textarea id="post-content" rows = 15 cols = 50 name="content"></textarea>
	</div>
	
	<div class="form-set">
		<label for="post-passphrase">Passphrase</label>
		<input type="password" id="post-passphrase" name="passphrase">
	</div>
</form>

<style>
.form-set {
	display: flex;	
	flex-direction: row;
	justify-content: space-between;
	align-items: start;
	padding-bottom: 8px; 
}

.form-set input, textarea {
	width:80%;
}
</style>`,
                large: true,
                removeOnClose: false,
                show: false,
                buttons: [{
                    label: "Submit", closeOnClick: false, onClick: () => {
                        const form = document.querySelector("#post-add-form") as HTMLFormElement;

                        const formData = new FormData(form);

                        const data = Object.fromEntries(formData.entries());

                        console.log(data);

                        const title = formData.get('title');
                        const description = formData.get('content');
                        const passphrase = formData.get('passphrase');

                        if (
                            !title ||
                            String(title).length === 0 ||
                            !description ||
                            String(description).length === 0 ||
                            !passphrase ||
                            String(passphrase).length === 0
                        ) {
                            console.error('missing params');
                            alert('Missing fields!');
                            return;
                        }

                        submitHook(String(title), String(description), String(passphrase));
                    }
                }]
            });
        }

        const els = Array.from(document.querySelectorAll('a[href="https://moodle.htlstp.ac.at/blog/edit.php?action=add"]'))

        els.map(el => {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                await (await modal).show();
            })
        });

        return true;
    };
}
