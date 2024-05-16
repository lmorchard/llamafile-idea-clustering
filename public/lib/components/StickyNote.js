import { html } from "../dom.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";

export class StickyNote extends StickyNotesCanvasChildDraggableMixin() {
  static observedAttributes = [
    ...StickyNotesCanvasChildDraggableMixin.observedAttributes,
    "color",
  ];

  static template = html`
    <style>
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
    </style>
    <div class="container">
      <slot></slot>
    </div>
  `;

  update() {
    super.update();

    this.style.backgroundColor = this.attributes.color.value;
  }
}

customElements.define("sticky-note", StickyNote);
