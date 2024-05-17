import { DraggableMixin } from "./DraggableMixin.js";

export const PanZoomableMixin = (Base) =>
  class extends DraggableMixin(Base) {
    constructor() {
      super();
      this.minZoom = 0.1;
      this.maxZoom = 5;
      this.wheelFactor = -0.1;
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
    }

    onWheel(ev) {
      ev.preventDefault();

      // Preserve previous zoom level and calculate new based on wheel direction
      const oldZoom = this.zoom;
      const wheel = Math.sign(ev.deltaY);
      const deltaZoom = Math.exp(wheel * this.wheelFactor);
      const newZoom = Math.min(
        Math.max(this.minZoom, this.zoom * deltaZoom),
        this.maxZoom
      );

      // Calculate the pointer position within the viewport
      const {
        x: vX,
        y: vY,
        width: vWidth,
        height: vHeight,
      } = this.getBoundingClientRect();
      const zoomX = ev.clientX - vX - vWidth / 2;
      const zoomY = ev.clientY - vY - vHeight / 2;

      // Calculate the relative offset between old & new zoom positions
      const zoomOffsetX = zoomX / oldZoom - zoomX / newZoom;
      const zoomOffsetY = zoomY / oldZoom - zoomY / newZoom;

      // Nudge the center of the viewport to keep the content under pointer in the same position
      const attrs = this.getObservedAttributes();
      const originX = parseFloat(attrs.originx);
      const originY = parseFloat(attrs.originy);
      this.attributes.originx.value = originX + zoomOffsetX;
      this.attributes.originy.value = originY + zoomOffsetY;

      this.zoom = newZoom;
    }

    getDragStartPosition() {
      return {
        x: parseFloat(this.attributes.originx.value),
        y: parseFloat(this.attributes.originy.value),
      };
    }

    onDragged(panStartX, panStartY, deltaX, deltaY) {
      this.attributes.originx.value = panStartX - deltaX / this.zoom;
      this.attributes.originy.value = panStartY - deltaY / this.zoom;
    }

    update() {
      const attrs = this.getObservedAttributes();
      const originX = parseFloat(attrs.originx);
      const originY = parseFloat(attrs.originy);

      const zoom = this.zoom;

      const parentEl = this;
      const viewport = this.viewport;

      const parentHalfWidth = parentEl.clientWidth / 2;
      const parentHalfHeight = parentEl.clientHeight / 2;

      const translateX = parentHalfWidth - originX;
      const translateY = parentHalfHeight - originY;

      viewport.style.transform = `
        scale(${zoom})
        translate(${translateX}px, ${translateY}px)
      `;
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
