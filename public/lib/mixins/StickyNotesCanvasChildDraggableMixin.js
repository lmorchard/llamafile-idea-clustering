import { LitElement } from "../vendor/lit-all.min.js";
import { DraggableMixin } from "./DraggableMixin.js";
import { PositionableMixin } from "./PositionableMixin.js";
import { SizeableMixin } from "./SizeableMixin.js";
import { ColorableMixin } from "./ColorableMixin.js";

export const StickyNotesCanvasChildDraggableMixin = (BaseClass = LitElement) =>
  class extends DraggableMixin(
    PositionableMixin(SizeableMixin(ColorableMixin(BaseClass)))
  ) {
    get zoom() {
      const parentCanvas = this.closest("sticky-notes-canvas");
      return parentCanvas ? parseFloat(parentCanvas.zoom) : 1;
    }

    onDragStart() {
      return {
        x: parseInt(this.x),
        y: parseInt(this.y),
      };
    }

    onDragged(sx, sy, dx, dy) {
      this.x = sx + dx / this.zoom;
      this.y = sy + dy / this.zoom;
    }
  };
