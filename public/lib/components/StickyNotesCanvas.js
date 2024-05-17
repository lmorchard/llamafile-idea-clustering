import { html, BaseElement, $ } from "../dom.js";
import { PanZoomableMixin } from "../mixins/PanZoomableMixin.js";
import { GraphLayoutMixin } from "../mixins/GraphLayoutMixin.js";

export class StickyNotesCanvas extends GraphLayoutMixin(
  PanZoomableMixin(BaseElement)
) {
  static observedAttributes = [
    ...PanZoomableMixin.observedAttributes,
    ...GraphLayoutMixin.observedAttributes,
  ];

  static template = html`
    <style>
      :host {
        display: block;
        overflow: hidden;
      }
      .viewport {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .canvas {

      }
      .background {
        position: absolute;
        width: 20000px;
        height: 10000px;
        left: -10000px;
        top: -5000px;
        z-index: -100;

        background-image: radial-gradient(circle at 5px 5px, rgba(0, 0, 0, 0.25) 3px, transparent 0);
        background-size: 40px 40px;
      }
    </style>

    <div class="viewport">
      <div class="canvas">
        <slot></slot>
      </div>
      <div class="background"></div>
    </div>
  `;

  get viewport() {
    return this.$(".viewport");
  }

  constructor() {
    super();
  }
}

customElements.define("sticky-notes-canvas", StickyNotesCanvas);
