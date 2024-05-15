import { BaseElement } from "../dom.js";
import { DraggableMixin } from "./DraggableMixin.js";
import { PositionableMixin } from "./PositionableMixin.js";

export const StickyNotesCanvasChildDraggableMixin = (Base = BaseElement) =>
  class extends DraggableMixin(PositionableMixin(Base)) {
    get zoom() {
      const parentCanvas = this.closest("sticky-notes-canvas");
      return parentCanvas ? parseFloat(parentCanvas.zoom) : 1;
    }

    getDragStartPosition() {
      return {
        x: parseInt(this.attributes.x.value),
        y: parseInt(this.attributes.y.value),
      };
    }

    onDragged(sx, sy, dx, dy) {
      this.attributes.x.value = sx + dx;
      this.attributes.y.value = sy + dy;
    }
  };

StickyNotesCanvasChildDraggableMixin.observedAttributes = [
  ...PositionableMixin.observedAttributes,
];
