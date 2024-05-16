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
        position: absolute;
        top: 0;
        left: 0;
        width: 1000px;
        height: 1000px;
        transform: translate(50%, 50%);

        /*
        --dot-bg: rgba(250, 250, 250, 1.0);
        --dot-color: #000;
        --dot-size: 1px;
        --dot-space: 22px;
        background: linear-gradient(
              90deg,
              var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
              transparent 1%
            )
            center / var(--dot-space) var(--dot-space),
          linear-gradient(
              var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
              transparent 1%
            )
            center / var(--dot-space) var(--dot-space),
          var(--dot-color);
          */
      }
    </style>

    <div class="viewport">
      <div class="canvas">
        <slot></slot>
      </div>
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
