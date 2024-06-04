import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";

const BaseClass = StickyNotesCanvasChildDraggableMixin(LitElement);
export class StickyNotesClusterTopic extends BaseClass {
  static styles = css`
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
  `;
  render() {
    return html` <span class="title">${this.title}</span> `;
  }
}

customElements.define("sticky-notes-cluster-topic", StickyNotesClusterTopic);

export class StickyNotesClusterLink extends LitElement {
  static properties = {
    id: { type: String },
    href: { type: String },
  };
  static styles = css`
    :host {
      visibility: hidden;
    }
  `;
  render() {
    return;
  }
}

customElements.define("sticky-notes-cluster-link", StickyNotesClusterLink);
