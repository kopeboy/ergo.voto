<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';

	export let content = '';
	export let placeholder = 'Scrivi qui...';
	export let maxLength: number | undefined = undefined;
	export let disabled = false;
	export let onUpdate: ((html: string) => void) | undefined = undefined;

	let element: HTMLDivElement;
	let editor: Editor;
	let showLinkInput = false;
	let linkUrl = '';
	let linkInputElement: HTMLInputElement;

	$: if (editor && disabled !== undefined) {
		editor.setEditable(!disabled);
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [2, 3]
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-blue-600 underline hover:text-blue-800'
					}
				}),
				Placeholder.configure({
					placeholder
				})
			],
			content,
			editable: !disabled,
			onTransaction: () => {
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				content = html;
				if (onUpdate) {
					onUpdate(html);
				}
			},
			editorProps: {
				attributes: {
					class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2'
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function toggleBold() {
		editor.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor.chain().focus().toggleItalic().run();
	}

	function toggleBulletList() {
		editor.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor.chain().focus().toggleOrderedList().run();
	}

	function toggleLinkInput() {
		if (editor.isActive('link')) {
			editor.chain().focus().unsetLink().run();
			showLinkInput = false;
		} else {
			const previousUrl = editor.getAttributes('link').href;
			linkUrl = previousUrl || '';
			showLinkInput = !showLinkInput;
			if (showLinkInput) {
				setTimeout(() => linkInputElement?.focus(), 0);
			}
		}
	}

	function applyLink() {
		if (linkUrl.trim()) {
			editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
		}
		showLinkInput = false;
		linkUrl = '';
	}

	function cancelLink() {
		showLinkInput = false;
		linkUrl = '';
		editor.chain().focus().run();
	}

	$: isActive = (name: string) => editor?.isActive(name) || false;
	$: textLength = editor ? (editor.state.doc.textContent?.length || 0) : 0;
</script>

<div class="rich-text-editor" class:disabled>
	<div class="toolbar">
		<button
			type="button"
			class="toolbar-btn"
			class:active={isActive('bold')}
			on:click={toggleBold}
			disabled={disabled}
			title="Grassetto (Ctrl+B)"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h5a3 3 0 0 1 0 6H4V2zm0 6h6a3 3 0 0 1 0 6H4V8z" fill="currentColor"/>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={isActive('italic')}
			on:click={toggleItalic}
			disabled={disabled}
			title="Corsivo (Ctrl+I)"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M6 2h8v2h-3l-3 8h3v2H3v-2h3l3-8H6V2z" fill="currentColor"/>
			</svg>
		</button>
		<div class="toolbar-divider"></div>
		<button
			type="button"
			class="toolbar-btn"
			class:active={isActive('bulletList')}
			on:click={toggleBulletList}
			disabled={disabled}
			title="Lista puntata"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<circle cx="2" cy="3" r="1.5" fill="currentColor"/>
				<circle cx="2" cy="8" r="1.5" fill="currentColor"/>
				<circle cx="2" cy="13" r="1.5" fill="currentColor"/>
				<line x1="6" y1="3" x2="14" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		</button>
		<button
			type="button"
			class="toolbar-btn"
			class:active={isActive('orderedList')}
			on:click={toggleOrderedList}
			disabled={disabled}
			title="Lista numerata"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<text x="0" y="4" font-size="4" fill="currentColor" font-weight="600">1.</text>
				<text x="0" y="9" font-size="4" fill="currentColor" font-weight="600">2.</text>
				<text x="0" y="14" font-size="4" fill="currentColor" font-weight="600">3.</text>
				<line x1="6" y1="3" x2="14" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				<line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		</button>
		<div class="toolbar-divider"></div>
		<button
			type="button"
			class="toolbar-btn"
			class:active={isActive('link')}
			on:click={toggleLinkInput}
			disabled={disabled}
			title="Inserisci link"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M7.5 10.5l-2 2a2.121 2.121 0 1 1-3-3l2-2m7-2l2-2a2.121 2.121 0 1 0-3-3l-2 2m-4 7l6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		{#if maxLength}
			<div class="char-count" class:warning={textLength > maxLength * 0.9}>
				{textLength}/{maxLength}
			</div>
		{/if}
	</div>
	{#if showLinkInput}
		<div class="link-input-panel">
			<input
				type="url"
				bind:this={linkInputElement}
				bind:value={linkUrl}
				placeholder="https://esempio.com"
				class="link-input"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						applyLink();
					} else if (e.key === 'Escape') {
						e.preventDefault();
						cancelLink();
					}
				}}
			/>
			<button type="button" class="link-btn link-btn-apply" on:click={applyLink}>
				✓
			</button>
			<button type="button" class="link-btn link-btn-cancel" on:click={cancelLink}>
				✕
			</button>
		</div>
	{/if}
	<div class="editor-container" bind:this={element}></div>
</div>

<style>
	.rich-text-editor {
		border: 1px solid #d1d5db;
		border-radius: 8px;
		overflow: hidden;
		background: white;
	}

	.rich-text-editor.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		flex-wrap: wrap;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid transparent;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
		color: #374151;
	}

	.toolbar-btn svg {
		display: block;
	}

	.toolbar-btn:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.toolbar-btn.active {
		background: #dbeafe;
		border-color: #93c5fd;
		color: #1e40af;
	}

	.toolbar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: #d1d5db;
		margin: 0 0.25rem;
	}

	.char-count {
		margin-left: auto;
		font-size: 0.75rem;
		color: #6b7280;
		padding: 0 0.5rem;
	}

	.char-count.warning {
		color: #f59e0b;
		font-weight: 600;
	}

	.editor-container {
		border: 2px solid transparent;
		border-radius: 0 0 8px 8px;
		transition: border-color 0.15s;
	}

	.editor-container:focus-within {
		border-color: #3b82f6;
	}

	:global(.rich-text-editor .ProseMirror) {
		outline: none;
	}

	:global(.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #9ca3af;
		pointer-events: none;
		height: 0;
	}

	:global(.rich-text-editor .ProseMirror a) {
		color: #2563eb;
		text-decoration: underline;
	}

	:global(.rich-text-editor .ProseMirror a:hover) {
		color: #1e40af;
	}

	:global(.rich-text-editor .ProseMirror ul, .rich-text-editor .ProseMirror ol) {
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	:global(.rich-text-editor .ProseMirror li) {
		margin: 0.25rem 0;
	}

	:global(.rich-text-editor .ProseMirror strong) {
		font-weight: 600;
	}

	:global(.rich-text-editor .ProseMirror em) {
		font-style: italic;
	}

	.link-input-panel {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.link-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.15s;
	}

	.link-input:focus {
		border-color: #3b82f6;
	}

	.link-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		transition: all 0.15s;
	}

	.link-btn-apply {
		background: #10b981;
		color: white;
	}

	.link-btn-apply:hover {
		background: #059669;
	}

	.link-btn-cancel {
		background: #ef4444;
		color: white;
	}

	.link-btn-cancel:hover {
		background: #dc2626;
	}
</style>
