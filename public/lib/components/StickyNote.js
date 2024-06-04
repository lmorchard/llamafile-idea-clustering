import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";

const BaseClass = StickyNotesCanvasChildDraggableMixin(LitElement);
export class StickyNote extends BaseClass {
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
      z-index: 10;
    }
    :host .container {
    }
  `;
  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("sticky-note", StickyNote);
