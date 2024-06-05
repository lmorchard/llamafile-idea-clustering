import { LitElement, css } from "../vendor/lit-all.min.js";
import { DraggableMixin } from "./DraggableMixin.js";
import { PositionableMixin } from "./PositionableMixin.js";
import { SizeableMixin } from "./SizeableMixin.js";
import { ColorableMixin } from "./ColorableMixin.js";

export const StickyNotesCanvasChildMixin = (BaseClass = LitElement) =>
  class extends DraggableMixin(
    PositionableMixin(SizeableMixin(ColorableMixin(BaseClass)))
  ) {
    static styles = css`
      :host {
        position: absolute;
        padding: 1em;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
        z-index: 0;
      }
    `

    get zoom() {
      const parentCanvas = this.closest("sticky-notes-canvas");
      return parentCanvas ? parseFloat(parentCanvas.zoom) : 1;
    }

    onDragStart() {
      return {
        x: this.x,
        y: this.y,
      };
    }

    onDragged(sx, sy, dx, dy) {
      this.x = sx + dx / this.zoom;
      this.y = sy + dy / this.zoom;
    }
  };
