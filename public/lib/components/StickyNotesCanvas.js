import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { PanZoomableMixin } from "../mixins/PanZoomableMixin.js";
import { GraphLayoutMixin } from "../mixins/GraphLayoutMixin.js";

const BaseElement = GraphLayoutMixin(PanZoomableMixin(LitElement));
export class StickyNotesCanvas extends BaseElement {
  static styles = css`
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
    .background {
      position: absolute;
      width: 20000px;
      height: 10000px;
      left: -10000px;
      top: -5000px;
      z-index: -100;
      background-image: radial-gradient(
        circle at 5px 5px,
        rgba(0, 0, 0, 0.25) 3px,
        transparent 0
      );
      background-size: 40px 40px;
    }
  `;

  render() {
    return html`
      <div class="viewport">
        <div class="canvas">
          <slot></slot>
        </div>
        <div class="background"></div>
      </div>
    `;
  }
}

customElements.define("sticky-notes-canvas", StickyNotesCanvas);
