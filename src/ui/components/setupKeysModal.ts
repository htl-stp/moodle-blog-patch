import { MoodleApi } from '../../moodle/MoodleApi';
import { openModal } from '../modal';
import { generatePassphrase } from '../../crypto/passphrase';
import { deriveKeypair } from '../../crypto/keypair';
import {
	CryptoKeyEnvelopeString,
	extractKeyEnvelopeFromTags,
} from '../../codec/keyEnvelope';

export async function setupKeys() {
	const userData = await MoodleApi.getInstance().getUserData();

	let key;
	try {
		const envelope = extractKeyEnvelopeFromTags(userData.tags, userData.userid);

		key = envelope.public_key;
	} catch (_) {}

	if (key) {
		return;
	}

	const modal = await openModal({
		title: 'Key Setup',
		body: `
	<p>To be able to use the moodle blog, you need a passphrase first.</p>
	<p>If you ever lose this passphrase, you will <strong>NEVER</strong> be able to post again!</p>
	
	<div style="display: flex; flex-direction: row; justify-content: space-between;">
		<code id="passphrase"></code>
		
		<div>
			<button id="btn-regenerate">Regenerate</button>
			<button id="btn-copy">Copy</button>
		</div>
	</div>
	
	<p>Retype Passphrase:</p>
	<input id="input-retype" type="text" onpaste="return false" style="width: 50%">
	
	<button id="btn-submit">Submit</button>
`,
		large: true,
	});

	let phrase = generatePassphrase();

	const passPhraseField = document.querySelector('#passphrase')!;
	const regenerateButton = document.querySelector('#btn-regenerate')!;
	const copyButton = document.querySelector('#btn-copy')!;
	const submitButton = document.querySelector('#btn-submit')!;
	const retypeInput = document.querySelector(
		'#input-retype',
	)! as HTMLInputElement;

	passPhraseField.textContent = phrase;

	regenerateButton.addEventListener('click', (e) => {
		phrase = generatePassphrase();
		passPhraseField.textContent = phrase;
	});

	copyButton.addEventListener('click', (e) => {
		navigator.clipboard.writeText(passPhraseField.textContent);
	});

	submitButton.addEventListener('click', async (e) => {
		if (retypeInput.value === phrase) {
			const keys = await deriveKeypair(phrase, userData.userid);

			console.log('Add crypto key');
			await MoodleApi.getInstance().addInterests([
				CryptoKeyEnvelopeString.encode({
					public_key: keys.publicKeyB64u,
					user_id: userData.userid,
					name: userData.name,
				}),
			]);

			openModal({
				title: 'Setup complete!',
				body: `<p>You're all set! The setup is complete.</p>
<p>Here's your passphrase once more, in case you still didn't save it:</p>
<code>${phrase}</code>`,
			});

			modal.destroy();
		} else {
			alert('Wrong passphrase!');
		}
	});
}
