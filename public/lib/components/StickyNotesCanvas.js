import { BaseElement, html } from "../dom.js";
import { DraggableMixin } from "../mixins/DraggableMixin.js";

export class StickyNotesCanvas extends DraggableMixin(BaseElement) {
  static observedAttributes = [
    "originx",
    "originy",
    "zoom",
    "minzoom",
    "maxzoom",
    "wheelfactor",
  ];

  static template = html`
    <style>
      :host {
        display: block;
        overflow: hidden;
      }
      .container {
        position: relative;
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;
      }
    </style>

    <div class="container">
      <div class="inner-canvas">
        <slot></slot>
      </div>
    </div>
  `;

  constructor() {
    super();
    this.minZoom = 0.1;
    this.maxZoom = 5;
    this.wheelFactor = 0.001;
    this.zoomOrigin = { x: 0, y: 0 };
  }

  get zoom() {
    return parseFloat(this.attributes.zoom.value);
  }

  set zoom(value) {
    this.attributes.zoom.value = value;
    this.update();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("wheel", this.onWheel);
  }

  onWheel(ev) {
    ev.preventDefault();
    this.zoomOrigin = { x: ev.clientX, y: ev.clientY };
    this.zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom + ev.deltaY * this.wheelFactor)
    );
  }

  getDragStartPosition() {
    return {
      x: parseInt(this.attributes.originx.value),
      y: parseInt(this.attributes.originy.value),
    };
  }

  onDragged(sx, sy, dx, dy) {
    this.attributes.originx.value = sx - dx;
    this.attributes.originy.value = sy - dy;
  }

  update() {
    const attrs = this.getObservedAttributes();
    const zoom = parseFloat(attrs.zoom);
    const originX = parseFloat(attrs.originx);
    const originY = parseFloat(attrs.originy);

    const parentEl = this;
    const container = this.shadowRoot.querySelector(".container");
    const innerCanvas = this.shadowRoot.querySelector(".inner-canvas");

    const parentHalfWidth = parentEl.clientWidth / 2;
    const parentHalfHeight = parentEl.clientHeight / 2;

    const translateX = parentHalfWidth - originX;
    const translateY = parentHalfHeight - originY;

    container.style.transformOrigin = `${parentHalfWidth}px ${parentHalfHeight}px`;

    container.style.transform = `
      scale(${zoom})
      translate(${translateX}px, ${translateY}px)
    `;

    innerCanvas.style.transform = `
    `;
  }
}
customElements.define("sticky-notes-canvas", StickyNotesCanvas);


