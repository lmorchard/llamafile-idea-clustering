import { LitElement } from "../vendor/lit-all.min.js";

export const SizeableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static properties = {
      "width": { type: Number, reflect: true },
      "height": { type: Number, reflect: true },
    };
    updated(changedProperties) {
      super.updated(changedProperties);
      this.style.width = `${this.width}px`;
      this.style.height = `${this.height}px`;
    }
  };
