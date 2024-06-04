import { LitElement } from "../vendor/lit-all.min.js";

export const DraggableMixin = (BaseClass = LitElement) =>
  class extends BaseClass {
    connectedCallback() {
      super.connectedCallback();
      this.dragging = false;
      this.addEventListener("mousedown", this.onMouseDown);
    }

    onMouseDown(ev) {
      this.dragging = true;
      const startPosition = this.onDragStart();
      const dragClientStart = { x: ev.clientX, y: ev.clientY };

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

    onDragStart() {
      return { x: 0, y: 0 };
    }

    onDragged(startX, startY, deltaX, deltaY) {}

    onDragEnd() {}
  };
