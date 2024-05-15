export const DraggableMixin = (Base) => class extends Base {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("mousedown", this.onMouseDown);
  }

  onMouseDown(ev) {
    const startPosition = this.getDragStartPosition();
    const dragStart = { x: ev.clientX, y: ev.clientY };

    const onMouseMove = (ev) => {
      const zoom = this.zoom;
      const dx = (ev.clientX - dragStart.x) / zoom;
      const dy = (ev.clientY - dragStart.y) / zoom;
      this.onDragged(startPosition.x, startPosition.y, dx, dy);
    };
    document.addEventListener("mousemove", onMouseMove);

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mouseup", onMouseUp);

    ev.preventDefault();
    ev.stopPropagation();
  }

  get zoom() {
    return 1.0;
  }

  getDragStartPosition() {
    return { x: 0, y: 0 };
  }

  onDragged(sx, sy, dx, dy) { }
};
