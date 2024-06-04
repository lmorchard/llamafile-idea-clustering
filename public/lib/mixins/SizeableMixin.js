import { LitElement } from "../vendor/lit-all.min.js";

export const SizeableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static properties = {
      "width": { type: Number },
      "height": { type: Number },
    };
    updated(changedProperties) {
      super.updated(changedProperties);
      this.style.width = `${this.width}px`;
      this.style.height = `${this.height}px`;
    }
  };
