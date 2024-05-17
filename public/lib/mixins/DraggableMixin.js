export const DraggableMixin = (Base) =>
  class extends Base {
    connectedCallback() {
      super.connectedCallback();

      this.dragging = false;
      this.addEventListener("mousedown", this.onMouseDown);
    }

    onMouseDown(ev) {
      const startPosition = this.getDragStartPosition();
      const dragClientStart = { x: ev.clientX, y: ev.clientY };

      this.dragging = true;
      this.onDragStart();

      const onMouseMove = (ev) => {
        const dx = ev.clientX - dragClientStart.x;
        const dy = ev.clientY - dragClientStart.y;
        this.onDragged(startPosition.x, startPosition.y, dx, dy);
      };
      document.addEventListener("mousemove", onMouseMove);

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        this.dragging = false;
        this.onDragEnd();
      };
      document.addEventListener("mouseup", onMouseUp);

      ev.preventDefault();
      ev.stopPropagation();
    }

    getDragStartPosition() {
      return { x: 0, y: 0 };
    }

    onDragStart() {}

    onDragged(sx, sy, dx, dy) {}

    onDragEnd() {}
  };
