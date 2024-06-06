import { LitElement, html, render } from "../vendor/lit-all.min.js";
import { Pane } from "../vendor/tweakpane.min.js";

export class StickyNotesTweakPane extends LitElement {
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

    [
      { title: "Add demo notes", event: "demo-notes" },
      { title: "Delete all notes", event: "clear-notes"},
      { separator: true },
      { title: "Organize notes", event: "organize-notes" },
      { title: "Reset topics", event: "reset-topics"},
      { separator: true },
      { title: "Delete selected note", event: "delete-note"},
      { title: "Add new note", event: "add-note"},
    ].map((buttonDfn) => {
      if (buttonDfn.separator) {
        actionsSection.addBlade({ view: 'separator' });
        return;
      };
      const button = actionsSection.addButton(buttonDfn);
      button.on("click", () => {
        this.dispatchEvent(new CustomEvent(buttonDfn.event));
      });
      return button;
    });

    const llmParameters = this.app.llmParameters;
    const llmParameterBindings = [
      {key: "temperature", min: 0, max: 1, step: 0.01},
      {key: "top_k", min: 1, max: 100, step: 1},
      {key: "top_p", min: 0, max: 1, step: 0.01},
      {key: "min_p", min: 0, max: 1, step: 0.01},
      {key: "n_predict", min: 1, max: 100, step: 1},
      {key: "n_keep", min: 0, max: 100, step: 1},
      {key: "seed", min: -1, max: 100, step: 1},
    ].map((bindingDefn) => {
      const binding = parametersSection.addBinding(llmParameters, bindingDefn.key, {
        min: bindingDefn.min,
        max: bindingDefn.max,
        step: bindingDefn.step,
      });
      return binding;
    });

    parametersSection.addBlade({ view: 'separator' });

    [
      { title: "Edit LLM prompt", event: "edit-prompt"},
    ].map((buttonDfn) => {
      const button = parametersSection.addButton(buttonDfn);
      button.on("click", () => {
        this.dispatchEvent(new CustomEvent(buttonDfn.event));
      });
      return button;
    });

    const uiOptions = this.app.uiOptions;
    const upOptionBindings = [
      { key: 'numClusters', min: 3, max: 20, step: 1 },
      { key: 'clusterLayoutRadius', min: 50, max: 5000, step: 100 },
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
