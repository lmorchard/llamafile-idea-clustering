import { html, BaseElement } from "../dom.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";

export class StickyNotesClusterTopic extends StickyNotesCanvasChildDraggableMixin() {
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
        text-align: center;
        align-items: center;
        border: 1px solid black;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
        z-index: 0;
      }
    </style>
    <span class="title"></span>
  `;

  update() {
    super.update();

    this.style.backgroundColor = this.attributes.color.value;
    this.$(".title").innerText = this.getAttribute("title");
  }
}

customElements.define("sticky-notes-cluster-topic", StickyNotesClusterTopic);

export class StickyNotesClusterLink extends BaseElement {
  static observedAttributes = ["id", "href"];
  static template = html`
    <style>
      :host {
        visibility: hidden;
      }
    </style>
  `;
}

customElements.define("sticky-notes-cluster-link", StickyNotesClusterLink);
