import { BaseElement } from "../dom.js";

export const PositionableMixin = (BaseClass = BaseElement) =>
  class extends BaseClass {
    static observedAttributes = [...BaseClass.observedAttributes, "x", "y"];

    constructor() {
      super();
    }

    update() {
      super.update();
      const attrs = this.getObservedAttributes();
      this.style.left = `${attrs.x}px`;
      this.style.top = `${attrs.y}px`;
    }
  };
