export const PositionableMixin = (Base) => class extends Base {
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

PositionableMixin.observedAttributes = ["x", "y"];