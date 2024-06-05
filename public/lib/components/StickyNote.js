import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { StickyNotesCanvasChildMixin } from "../mixins/StickyNotesCanvasChildMixin.js";
import { SelectableMixin } from "../mixins/SelectableMixin.js";

const BaseElement = SelectableMixin(StickyNotesCanvasChildMixin(LitElement));
export class StickyNote extends BaseElement {
  static properties = {
    contentEditable: { type: String, reflect: true },
  };

  /*
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  */

  static styles = [
    BaseElement.styles,
    css`
      :host(.selected) {
        border: 6px dotted black;
      }
      slot[contenteditable="true"] {
        border: 1px solid black;
        background-color: white;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("dblclick", this.onDoubleClick.bind(this));
  }

  onDoubleClick(ev) {
    console.log("onDoubleClick", ev);
  }

  onSelected() {
    this.contentEditable = "true";
  }

  onDeselected() {
    this.contentEditable = "false";
  }

  render() {
    return html`
      <div class="container">
        <slot ?contenteditable=${this.contentEditable}></slot>
      </div>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has("contentEditable")) {
      if (this.contentEditable === "true") {
        this.shadowRoot.querySelector("slot").focus();
      }
    }
  }
}

customElements.define("sticky-note", StickyNote);
