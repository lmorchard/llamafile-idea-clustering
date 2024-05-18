import { DraggableMixin } from "./DraggableMixin.js";

export const PanZoomableMixin = (ClassToExtend) => {
  const BaseClass = DraggableMixin(ClassToExtend);

  return class extends BaseClass {
    static observedAttributes = [
      ...BaseClass.observedAttributes,
      "originx",
      "originy",
      "zoom",
      "minzoom",
      "maxzoom",
      "wheelfactor",
    ];

    constructor() {
      super();
      this.minZoom = 0.2;
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

    get zoom() {
      return parseFloat(this.attributes.zoom.value);
    }

    set zoom(value) {
      this.attributes.zoom.value = value;
    }

    onWheel(ev) {
      ev.preventDefault();

      // Preserve previous zoom level and calculate new based on wheel direction
      const deltaZoom = Math.exp(Math.sign(ev.deltaY) * this.wheelFactor);
      const newZoom = Math.min(
        Math.max(this.minZoom, this.zoom * deltaZoom),
        this.maxZoom
      );
      const oldZoom = this.zoom;
      this.zoom = newZoom;

      // Calculate the pointer position within the host relative to center
      const hostRect = this.getBoundingClientRect();
      const zoomX = ev.clientX - hostRect.x - hostRect.width / 2;
      const zoomY = ev.clientY - hostRect.y - hostRect.height / 2;

      // Calculate the relative offset between old & new zoom positions
      const zoomOffsetX = zoomX / oldZoom - zoomX / newZoom;
      const zoomOffsetY = zoomY / oldZoom - zoomY / newZoom;

      // Nudge the center of the viewport to keep the content under pointer in the same position
      const originX = parseFloat(this.attributes.originx.value);
      const originY = parseFloat(this.attributes.originy.value);
      this.attributes.originx.value = originX + zoomOffsetX;
      this.attributes.originy.value = originY + zoomOffsetY;
    }

    onDragStart() {
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
      const zoom = this.zoom;

      const originX = parseFloat(this.attributes.originx.value);
      const originY = parseFloat(this.attributes.originy.value);

      const translateX = this.clientWidth / 2 - originX;
      const translateY = this.clientHeight / 2 - originY;

      this.viewport.style.transform = `
        scale(${zoom})
        translate(${translateX}px, ${translateY}px)
      `;
    }
  };
};
