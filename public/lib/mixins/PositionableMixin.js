import { LitElement } from "../vendor/lit-all.min.js";

export const PositionableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    static properties = {
      "x": { type: Number },
      "y": { type: Number },
    };
    updated(changedProperties) {
      super.updated(changedProperties);
      this.style.left = `${this.x}px`;
      this.style.top = `${this.y}px`;
    }
  };
