export const PositionableMixin = (Base) => class extends Base {
  constructor() {
    super();
  }

  update() {
    const attrs = this.getObservedAttributes();

    this.style.left = `${attrs.x}px`;
    this.style.top = `${attrs.y}px`;
    this.style.width = `${attrs.width}px`;
    this.style.height = `${attrs.height}px`;
    this.style.backgroundColor = attrs.color;
  }
};

PositionableMixin.observedAttributes = ["x", "y", "width", "height"];