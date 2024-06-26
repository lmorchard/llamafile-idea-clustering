import { LitElement } from "../vendor/lit-all.min.js";

export const ColorableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static properties = {
      color: { type: String, reflect: true },
    };
    updated(changedProperties) {
      super.updated(changedProperties);
      this.style.backgroundColor = this.color;
    }
  };
