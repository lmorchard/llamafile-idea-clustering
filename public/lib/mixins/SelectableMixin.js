import { LitElement } from "../vendor/lit-all.min.js";

const CLASS_SELECTABLE_MANAGER = "selectable-manager";
const CLASS_SELECTABLE = "selectable";
const CLASS_SELECTED = "selected";

export const SelectableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static CLASS_SELECTABLE_MANAGER = CLASS_SELECTABLE_MANAGER;
    static CLASS_SELECTABLE = CLASS_SELECTABLE;
    static CLASS_SELECTED = CLASS_SELECTED;

    static properties = {
      selected: { type: Boolean, reflect: true },
    };

    connectedCallback() {
      super.connectedCallback();
      this.selected = false;
      this.addEventListener("click", this.onClick.bind(this));
    }

    updated(changedProperties) {
      super.updated(changedProperties);
      this.classList.add(this.constructor.CLASS_SELECTABLE);
    }

    get manager() {
      return this.closest(`.${this.constructor.CLASS_SELECTABLE_MANAGER}`);
    }

    onClick(ev) {
      if (!this.manager) return;
      this.manager.onSelectableClicked(ev);
    }

    setSelected(selected) {
      if (this.selected === selected) return;
      this.selected = selected;
      if (selected) {
        this.classList.add(this.constructor.CLASS_SELECTED);
        this.onSelected();
      } else {
        this.classList.remove(this.constructor.CLASS_SELECTED);
        this.onDeselected();
      }
    }

    onSelected() {}

    onDeselected() {}
  };

export const SelectableManagerMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static CLASS_SELECTABLE_MANAGER = CLASS_SELECTABLE_MANAGER;
    static CLASS_SELECTABLE = CLASS_SELECTABLE;
    static CLASS_SELECTED = CLASS_SELECTED;

    updated(changedProperties) {
      super.updated(changedProperties);
      this.classList.add(this.constructor.CLASS_SELECTABLE_MANAGER);
    }

    onSelectableClicked(ev) {
      const clicked = ev.target.closest(`.${this.constructor.CLASS_SELECTABLE}`);
      const selectables = this.querySelectorAll(
        `.${this.constructor.CLASS_SELECTABLE}`
      );
      for (const selectable of selectables) {
        selectable.setSelected(false);
      }
      clicked.setSelected(true);
    }
  };
