import { escapeHtml } from './sanitize';

declare const unsafeWindow: (Window & typeof globalThis) | undefined;

export interface MoodleModal {
	show(): Promise<void>;
	hide(): void;
	destroy(): void;
	getRoot(): any; // jQuery object
	getBody(): any; // jQuery object
	getFooter(): any; // jQuery object
	setTitle(title: string): void;
	setBody(body: string): void;
	setFooter(footer: string): void;
}

export interface ModalButton {
	label: string;
	/** Bootstrap variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | ... */
	variant?: string;
	/** Return false (or a promise resolving to false) to keep the modal open. */
	onClick?: (
		modal: MoodleModal,
		event: Event,
	) => void | boolean | Promise<void | boolean>;
	/** Close the modal after the click. Default: true. */
	closeOnClick?: boolean;
}

export interface OpenModalOptions {
	title: string;
	body: string;
	/** Extra raw HTML placed in the footer before the buttons. */
	footer?: string;
	buttons?: ModalButton[];
	large?: boolean; // default: false
	centered?: boolean; // default: true
	show?: boolean; // default: true
	removeOnClose?: boolean; // default: true
	onShown?: (modal: MoodleModal) => void;
	onHidden?: (modal: MoodleModal) => void;
}

type AmdRequire = (
	deps: string[],
	onLoad: (...modules: any[]) => void,
	onError?: (error: unknown) => void,
) => void;

function getPageWindow(): any {
	if (typeof unsafeWindow !== 'undefined' && unsafeWindow) return unsafeWindow;
	// Firefox sandbox fallback
	return (window as any).wrappedJSObject ?? window;
}

function waitForRequire(timeoutMs = 10000): Promise<(...args: any[]) => void> {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const check = () => {
			const req = getPageWindow().require;
			if (typeof req === 'function') return resolve(req);
			if (Date.now() - start > timeoutMs) {
				return reject(
					new Error('Moodle RequireJS (window.require) not found on this page'),
				);
			}
			setTimeout(check, 100);
		};
		check();
	});
}

async function loadAmd<T extends any[]>(deps: string[]): Promise<T> {
	const amdRequire = await waitForRequire();
	return new Promise<T>((resolve, reject) => {
		amdRequire.call(
			getPageWindow(),
			deps,
			(...mods: any[]) => resolve(mods as T),
			reject,
		);
	});
}

function renderButtons(buttons: ModalButton[]): string {
	return buttons
		.map(
			(b, i) =>
				`<button type="button" class="btn btn-${escapeHtml(b.variant ?? 'secondary')}" data-modal-btn="${i}">` +
				`${escapeHtml(b.label)}</button>`,
		)
		.join('');
}

export async function openModal(
	options: OpenModalOptions,
): Promise<MoodleModal> {
	const {
		title,
		body,
		footer = '',
		buttons = [],
		large = false,
		centered = true,
		show = true,
		removeOnClose = true,
		onShown,
		onHidden,
	} = options;

	const [Modal, Events] = await loadAmd<[any, any]>([
		'core/modal',
		'core/modal_events',
	]);

	const modal: MoodleModal = await Modal.create({
		title: escapeHtml(title),
		body,
		footer: footer + renderButtons(buttons),
		large,
		isVerticallyCentered: centered,
		removeOnClose,
		show: false,
	});

	// Delegated click handler for all custom buttons
	modal.getFooter().on('click', 'button[data-modal-btn]', async (e: any) => {
		const button = buttons[Number(e.currentTarget.dataset.modalBtn)];
		if (!button) return;

		let result: void | boolean;
		try {
			result = await button.onClick?.(modal, e.originalEvent ?? e);
		} catch (err) {
			console.error('[openModal] button handler failed', err);
			return; // keep the modal open on errors
		}
		if (button.closeOnClick !== false && result !== false) modal.hide();
	});

	if (onShown) modal.getRoot().on(Events.shown, () => onShown(modal));
	if (onHidden) modal.getRoot().on(Events.hidden, () => onHidden(modal));

	if (show) await modal.show();
	return modal;
}
