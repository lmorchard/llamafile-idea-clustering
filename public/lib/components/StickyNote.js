import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { StickyNotesCanvasChildMixin } from "../mixins/StickyNotesCanvasChildMixin.js";

const BaseElement = StickyNotesCanvasChildMixin(LitElement);
export class StickyNote extends BaseElement {
  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("sticky-note", StickyNote);
