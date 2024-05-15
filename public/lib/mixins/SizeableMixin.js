export const SizeableMixin = (Base) => class extends Base {
  constructor() {
    super();
  }

  update() {
    super.update();
    const attrs = this.getObservedAttributes();
    this.style.width = `${attrs.width}px`;
    this.style.height = `${attrs.height}px`;
  }
};

SizeableMixin.observedAttributes = ["width", "height"];