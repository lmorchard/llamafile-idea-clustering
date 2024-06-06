import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { Pane } from "../vendor/tweakpane.min.js";

export class StickyNotesTweakPane extends LitElement {
  static styles = css`
    dialog.prompt-editor {
      padding: 1em;
      width: 40vw;
    }
    dialog.prompt-editor label {
      display: block;
      margin: 0 0 1em 0;
    }
    dialog.prompt-editor textarea {
      width: 100%;
    }
    dialog.prompt-editor .actions {
      margin-top: 1em;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      width: 100%;
    }
    dialog.prompt-editor .actions button {
      padding: 0.5em 1em;
      margin-left: 0.5em;
    }
  `;

  render() {
    return html`
      <dialog class="prompt-editor" @click=${this.onClickPromptEditor}>
        <label>
          System prompt
          <textarea class="system" rows="7"></textarea>
        </label>
        <label>
          User prompt
          <textarea class="user" rows="7" autofocus></textarea>
        </label>
        <div class="actions">
          <button @click=${this.confirmPromptEditor}>Ok</button>
          <button @click=${this.cancelPromptEditor}>Cancel</button>
        </div>
      </dialog>
    `;
  }

  get app() {
    return this.getRootNode().host;
  }

  get promptEditor() {
    return this.shadowRoot.querySelector(".prompt-editor");
  }

  onClickPromptEditor(ev) {
    if (ev.target === this.promptEditor) this.cancelPromptEditor();
  }

  openPromptEditor() {
    this.promptEditor.querySelector("textarea.system").value = this.app.promptSystem;
    this.promptEditor.querySelector("textarea.user").value = this.app.promptUser;
    this.promptEditor.showModal();
  }

  confirmPromptEditor() {
    this.app.promptSystem = this.promptEditor.querySelector("textarea.system").value;
    this.app.promptUser = this.promptEditor.querySelector("textarea.user").value;
    this.promptEditor.close();
  }

  cancelPromptEditor() {
    this.promptEditor.close();
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
}

customElements.define("sticky-notes-tweak-pane", StickyNotesTweakPane);
