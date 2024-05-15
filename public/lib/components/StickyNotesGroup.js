import { html } from "../dom.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";

export class StickyNotesGroup extends StickyNotesCanvasChildDraggableMixin() {
  static observedAttributes = [
    ...StickyNotesCanvasChildDraggableMixin.observedAttributes,
    "color",
  ];

  static template = html`
    <style>
      :host {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
      }
      :host .container {
      }
    </style>
    <div class="container">
      <slot></slot>
      <span class="title"></span>
    </div>
  `;
  update() {
    super.update();
    this.$(".title").innerText = this.getAttribute("title");
  }
}
customElements.define("sticky-notes-group", StickyNotesGroup);
