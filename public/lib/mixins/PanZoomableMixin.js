import { LitElement } from "../vendor/lit-all.min.js";
import { DraggableMixin } from "./DraggableMixin.js";

export const PanZoomableMixin = (BaseClass = LitElement) =>
  class extends DraggableMixin(BaseClass) {
    static properties = {
      originx: { type: Number, reflect: true },
      originy: { type: Number, reflect: true  },
      zoom: { type: Number, reflect: true  },
      minzoom: { type: Number, reflect: true  },
      maxzoom: { type: Number, reflect: true  },
      wheelfactor: { type: Number, reflect: true  },
    };

    constructor() {
      super();
      this.minZoom = 0.2;
      this.maxZoom = 5;
      this.wheelFactor = -0.00125;
      this.zoomOrigin = { x: 0, y: 0 };
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("wheel", this.onWheel);
    }

    get viewport() {
      return this.shadowRoot.querySelector(".viewport");
    }

    onWheel(ev) {
      ev.preventDefault();

      // Preserve previous zoom level and calculate new based on wheel direction
      const oldZoom = this.zoom;
      const deltaZoom = ev.deltaY * this.wheelFactor;
      this.zoom = Math.min(
        Math.max(this.minZoom, this.zoom + deltaZoom),
        this.maxZoom
      );

      // Calculate the pointer position within the host relative to center
      const hostRect = this.getBoundingClientRect();
      const zoomX = ev.clientX - hostRect.x - hostRect.width / 2;
      const zoomY = ev.clientY - hostRect.y - hostRect.height / 2;

      // Calculate the relative offset between old & new zoom positions
      const zoomOffsetX = zoomX / oldZoom - zoomX / this.zoom;
      const zoomOffsetY = zoomY / oldZoom - zoomY / this.zoom;

      // Nudge the center of the viewport to keep the content under pointer in the same position
      this.originx = this.originx + zoomOffsetX;
      this.originy = this.originy + zoomOffsetY;
    }

    onDragStart() {
      return {
        x: this.originx,
        y: this.originy,
      };
    }

    onDragged(panStartX, panStartY, deltaX, deltaY) {
      this.originx = panStartX - deltaX / this.zoom;
      this.originy = panStartY - deltaY / this.zoom;
    }

    updated(changedProperties) {
      super.updated(changedProperties);

      const translateX = this.clientWidth / 2 - this.originx;
      const translateY = this.clientHeight / 2 - this.originy;

      this.viewport.style.transform = `
        scale(${this.zoom})
        translate(${translateX}px, ${translateY}px)
      `;
    }
  };
