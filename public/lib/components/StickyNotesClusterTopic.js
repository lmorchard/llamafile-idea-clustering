import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { StickyNotesCanvasChildMixin } from "../mixins/StickyNotesCanvasChildMixin.js";

const BaseElement = StickyNotesCanvasChildMixin(LitElement);
export class StickyNotesClusterTopic extends BaseElement {
  static styles = [
    BaseElement.styles,
    css`
      :host {
        z-index: -10;
      }
    `
  ]
  render() {
    return html`<span class="title">${this.title}</span>`;
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
}

customElements.define("sticky-notes-cluster-link", StickyNotesClusterLink);
