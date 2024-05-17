import { BaseElement } from "../dom.js";
import { DraggableMixin } from "./DraggableMixin.js";
import { PositionableMixin } from "./PositionableMixin.js";
import { SizeableMixin } from "./SizeableMixin.js";

export const StickyNotesCanvasChildDraggableMixin = (Base = BaseElement) =>
  class extends DraggableMixin(PositionableMixin(SizeableMixin(Base))) {
    get zoom() {
      const parentCanvas = this.closest("sticky-notes-canvas");
      return parentCanvas ? parseFloat(parentCanvas.zoom) : 1;
    }

    onDragStart() {
      return {
        x: parseInt(this.attributes.x.value),
        y: parseInt(this.attributes.y.value),
      };
    }

    onDragged(sx, sy, dx, dy) {
      this.attributes.x.value = sx + (dx / this.zoom);
      this.attributes.y.value = sy + (dy / this.zoom);
    }
  };

StickyNotesCanvasChildDraggableMixin.observedAttributes = [
  ...PositionableMixin.observedAttributes,
  ...SizeableMixin.observedAttributes,
];
