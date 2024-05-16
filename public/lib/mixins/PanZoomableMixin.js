import { DraggableMixin } from "./DraggableMixin.js";

export const PanZoomableMixin = (Base) => class extends DraggableMixin(Base) {
  constructor() {
    super();
    this.minZoom = 0.1;
    this.maxZoom = 5;
    this.wheelFactor = 0.001;
    this.zoomOrigin = { x: 0, y: 0 };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("wheel", this.onWheel);
  }

  get viewport() {
    return this.$(".viewport");
  }

  get canvas() {
    return this.$(".canvas");
  }

  get zoom() {
    return parseFloat(this.attributes.zoom.value);
  }

  set zoom(value) {
    this.attributes.zoom.value = value;
    this.update();
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
    const container = this.viewport;

    // console.log(container.getBoundingClientRect());

    const parentHalfWidth = parentEl.clientWidth / 2;
    const parentHalfHeight = parentEl.clientHeight / 2;

    const translateX =  - originX;
    const translateY =  - originY;

    //container.style.transformOrigin = `${parentHalfWidth}px ${parentHalfHeight}px`;
    //container.style.transformOrigin = `${this.zoomOrigin.x}px ${this.zoomOrigin.y}px`;
    //container.style.scale = zoom;
    container.style.transform = `
    scale(${zoom})
    translate(${translateX}px, ${translateY}px)
    `;
    //console.log(container.style.transform);
  }
};

PanZoomableMixin.observedAttributes = [
  "originx",
  "originy",
  "zoom",
  "minzoom",
  "maxzoom",
  "wheelfactor",
];
