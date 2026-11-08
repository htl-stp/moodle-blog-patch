import type { Draft } from '../../services/publishService';
import { MoodleModal, openModal } from '../modal';

const ADD_LINK = 'a[href$="/blog/edit.php?action=add"]';

const FORM_HTML = `
<form id="post-add-form" class="mb-form">
	<div class="mb-field">
		<label for="post-title">Title</label>
		<input type="text" id="post-title" name="title">
	</div>
	<div class="mb-field">
		<label for="post-content">Content</label>
		<textarea id="post-content" name="content" rows="15"></textarea>
	</div>
	<div class="mb-field">
		<label for="post-passphrase">Passphrase</label>
		<input type="password" id="post-passphrase" name="passphrase" autocomplete="off">
	</div>
</form>
<style>
	.mb-field { display: flex; justify-content: space-between; align-items: start; padding-bottom: 8px; }
	.mb-field input, .mb-field textarea { width: 80%; }
</style>`;

function readDraft(form: HTMLFormElement): Draft | null {
	const data = new FormData(form);
	const get = (key: string) => String(data.get(key) ?? '');

	const draft: Draft = {
		title: get('title').trim(),
		content: get('content').trim(),
		passphrase: get('passphrase'),
	};

	return draft.title && draft.content && draft.passphrase ? draft : null;
}

type SubmitHandler = (draft: Draft) => Promise<void>;

let modalPromise: Promise<MoodleModal> | undefined;

function getModal(onSubmit: SubmitHandler) {
	modalPromise ??= openModal({
		title: 'Add Post',
		body: FORM_HTML,
		large: true,
		show: false,
		removeOnClose: false,
		buttons: [
			{
				label: 'Submit',
				variant: 'primary',
				closeOnClick: false,
				onClick: async (modal, event) => {
					const button = (event.target as HTMLElement).closest('button')!;
					const form = modal
						.getRoot()[0]
						.querySelector('#post-add-form') as HTMLFormElement;

					const draft = readDraft(form);
					if (!draft) {
						alert('Missing fields!');
						return false;
					}

					button.disabled = true;
					try {
						await onSubmit(draft);
					} finally {
						button.disabled = false;
						form.querySelector<HTMLInputElement>('[name=passphrase]')!.value =
							'';
					}

					return false;
				},
			},
		],
	});
	return modalPromise;
}

export function installAddPostModal(onSubmit: SubmitHandler) {
	document.addEventListener('click', (e) => {
		if (!(e.target as Element).closest(ADD_LINK)) return;
		e.preventDefault();
		void getModal(onSubmit).then((modal) => modal.show());
	});
}
