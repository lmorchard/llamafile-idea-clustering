import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { Pane } from "../vendor/tweakpane.min.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

export class StickyNotesAppControls extends LitElement {
  render() {
    return html`
      <sticky-notes-prompt-editor></sticky-notes-prompt-editor>
      <sticky-notes-import-export-dialog></sticky-notes-import-export-dialog>
      <sticky-notes-about-dialog></sticky-notes-about-dialog>
    `;
  }

  get app() {
    return this.getRootNode().host;
  }

  firstUpdated() {
    super.firstUpdated();
    this.setupTweakPane();
  }

  setupTweakPane() {
    this.pane = new Pane();

    const [actionsSection, optionsSection, parametersSection, aboutSection] = [
      { title: "Actions" },
      { title: "UI Options" },
      { title: "LLM Parameters" },
      { title: "About" },
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
      { title: "Organize notes", event: "organize-notes" },
      { separator: true },
      { title: "Add new note", event: "add-note" },
      { title: "Add demo notes", event: "demo-notes" },
      {
        title: "Import / export text notes...",
        handler: this.openImportExportDialog,
      },
      { separator: true },
      { title: "Delete selected note", event: "delete-note" },
      { title: "Delete topics", event: "reset-topics" },
      { title: "Delete all notes", event: "clear-notes" },
    ].map(buttonFactory(actionsSection));

    parametersSection.addBinding(this.app, "model", {
      readonly: true,
      interval: 1000,
    });

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
        title: "Edit LLM prompt...",
        event: "edit-prompt",
        handler: this.openPromptEditor,
      },
    ].map(buttonFactory(parametersSection));

    const zoomSlider = optionsSection.addBinding(this.app.canvas, "zoom", {
      min: 0.1,
      max: 2,
      step: 0.1,
      interval: 0.1,
    });

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

    aboutSection.addBinding(this.app.appMeta, "about", {
      readonly: true,
      interval: 1000,
      multiline: true,
      rows: 4
    });

    [
      {
        title: "More info...",
        handler: this.openAboutDialog,
      },
    ].map(buttonFactory(aboutSection));

  }

  openPromptEditor() {
    const promptEditor = this.shadowRoot.querySelector(
      "sticky-notes-prompt-editor"
    );
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
    const importExportDialog = this.shadowRoot.querySelector(
      "sticky-notes-import-export-dialog"
    );
    importExportDialog.open(this.app.notesToText(), (notesText) =>
      this.app.notesFromText(notesText)
    );
  }

  openAboutDialog() {
    const aboutDialog = this.shadowRoot.querySelector("sticky-notes-about-dialog");
    aboutDialog.open();
  }
}

customElements.define("sticky-notes-app-controls", StickyNotesAppControls);

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

customElements.define(
  "sticky-notes-import-export-dialog",
  StickyNotesImportExportDialog
);

export class StickyNotesAboutDialog extends ConfirmDialog {
  render() {
    return super.render(html`
      Hello there, this is good app.
    `);
  }

  renderActions() {
    return html`
      <button @click=${this.onCancel}>Close</button>
    `;
  }
}

customElements.define(
  "sticky-notes-about-dialog",
  StickyNotesAboutDialog
);
