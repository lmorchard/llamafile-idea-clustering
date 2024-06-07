import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { Pane } from "../vendor/tweakpane.min.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

export class StickyNotesTweakPane extends LitElement {
  render() {
    return html`
      <sticky-notes-prompt-editor></sticky-notes-prompt-editor>
      <sticky-notes-import-export-dialog></sticky-notes-import-export-dialog>
    `;
  }

  get app() {
    return this.getRootNode().host;
  }

  firstUpdated() {
    super.firstUpdated();

    this.pane = new Pane();

    const [actionsSection, parametersSection, optionsSection] = [
      { title: "Actions" },
      { title: "LLM Parameters" },
      { title: "UI Options" },
    ].map((section) => this.pane.addFolder(section));

    const buttonFactory = (section) => (buttonDfn) => {
      if (buttonDfn.separator) {
        actionsSection.addBlade({ view: "separator" });
        return;
      }
      const button = section.addButton(buttonDfn);
      const handler = buttonDfn.handler
        ? buttonDfn.handler.bind(this)
        : () => this.dispatchEvent(new CustomEvent(buttonDfn.event));
      button.on("click", handler);
      return button;
    };

    [
      { title: "Add demo notes", event: "demo-notes" },
      { title: "Delete all notes", event: "clear-notes" },
      { separator: true },
      { title: "Organize notes", event: "organize-notes" },
      { title: "Reset topics", event: "reset-topics" },
      { separator: true },
      { title: "Import / export text notes", handler: this.openImportExportDialog },
      { separator: true },
      { title: "Delete selected note", event: "delete-note" },
      { title: "Add new note", event: "add-note" },
    ].map(buttonFactory(actionsSection));

    const llmParameters = this.app.llmParameters;
    const llmParameterBindings = [
      { key: "temperature", min: 0, max: 1, step: 0.01 },
      { key: "top_k", min: 1, max: 100, step: 1 },
      { key: "top_p", min: 0, max: 1, step: 0.01 },
      { key: "min_p", min: 0, max: 1, step: 0.01 },
      { key: "n_predict", min: 1, max: 100, step: 1 },
      { key: "n_keep", min: 0, max: 100, step: 1 },
      { key: "seed", min: -1, max: 100, step: 1 },
    ].map((bindingDefn) => {
      const binding = parametersSection.addBinding(
        llmParameters,
        bindingDefn.key,
        {
          min: bindingDefn.min,
          max: bindingDefn.max,
          step: bindingDefn.step,
        }
      );
      return binding;
    });

    parametersSection.addBlade({ view: "separator" });

    [
      {
        title: "Edit LLM prompt",
        event: "edit-prompt",
        handler: this.openPromptEditor,
      },
    ].map(buttonFactory(parametersSection));

    const uiOptions = this.app.uiOptions;
    const upOptionBindings = [
      { key: "numClusters", min: 3, max: 20, step: 1 },
      { key: "clusterLayoutRadius", min: 50, max: 5000, step: 100 },
    ].map((bindingDefn) => {
      const binding = optionsSection.addBinding(uiOptions, bindingDefn.key, {
        min: bindingDefn.min,
        max: bindingDefn.max,
        step: bindingDefn.step,
      });
      return binding;
    });

    const zoomSlider = optionsSection.addBinding(this.app.canvas, "zoom", {
      min: 0.1,
      max: 2,
      step: 0.1,
      interval: 0.1,
    });
  }

  openPromptEditor() {
    const promptEditor = this.shadowRoot.querySelector("sticky-notes-prompt-editor");
    promptEditor.open(
      this.app.promptSystem,
      this.app.promptUser,
      ([promptSystem, promptUser]) => {
        this.app.promptSystem = promptSystem;
        this.app.promptUser = promptUser;
      }
    );
  }

  openImportExportDialog() {
    const importExportDialog = this.shadowRoot.querySelector("sticky-notes-import-export-dialog");
    importExportDialog.open(
      this.app.notesToText(),
      (notesText) => this.app.notesFromText(notesText),
    );
  }
}

customElements.define("sticky-notes-tweak-pane", StickyNotesTweakPane);

export class StickyNotesPromptEditor extends ConfirmDialog {
  render() {
    return super.render(html`
      <label>
        System prompt
        <textarea class="system" rows="7"></textarea>
      </label>
      <label>
        User prompt
        <textarea class="user" rows="7" autofocus></textarea>
      </label>
    `);
  }

  open(promptSystem, promptUser, onConfirm, onCancel) {
    this.dialog.querySelector("textarea.system").value = promptSystem;
    this.dialog.querySelector("textarea.user").value = promptUser;
    super.open(onConfirm, onCancel);
  }

  get returnValue() {
    return [
      this.dialog.querySelector("textarea.system").value,
      this.dialog.querySelector("textarea.user").value,
    ];
  }
}

customElements.define("sticky-notes-prompt-editor", StickyNotesPromptEditor);

export class StickyNotesImportExportDialog extends ConfirmDialog {
  render() {
    return super.render(html`
      <label>
        Notes
        <textarea class="notes" rows="30" autofocus></textarea>
      </label>
    `);
  }

  renderActions() {
    return html`
      <button @click=${this.onConfirm}>Import</button>
      <button @click=${this.onCancel}>Close</button>
    `;
  }

  open(notesText, onConfirm, onCancel) {
    this.dialog.querySelector("textarea.notes").value = notesText;
    super.open(onConfirm, onCancel);
  }

  get returnValue() {
    return this.dialog.querySelector("textarea.notes").value;
  }
}

customElements.define("sticky-notes-import-export-dialog", StickyNotesImportExportDialog);
