import { BaseElement } from "../dom.js";

export const SizeableMixin = (BaseClass = BaseElement) =>
  class extends BaseClass {
    static observedAttributes = [
      ...BaseClass.observedAttributes,
      "width",
      "height",
    ];

    update() {
      super.update();
      const attrs = this.getObservedAttributes();
      this.style.width = `${attrs.width}px`;
      this.style.height = `${attrs.height}px`;
    }
  };
