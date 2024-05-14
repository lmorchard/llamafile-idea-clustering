async function main() {
  console.log("READY.");
}

const html = (strings, ...values) =>
  strings.map((string, i) => string + (values[i] || "")).join("");

class BaseElement extends HTMLElement {
  static template = html`<slot></slot>`;

  constructor() {
    super();
    const template = this.template();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
  }

  template() {
    const template = this.ownerDocument.createElement("template");
    template.innerHTML = this.constructor.template;
    return template.content.cloneNode(true);
  }

  connectedCallback() {
    this.scheduleUpdate();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.scheduleUpdate();
    }
  }

  getObservedAttributes() {
    const attrs = {};
    for (const name of this.constructor.observedAttributes) {
      attrs[name] = this.getAttribute(name);
    }
    return attrs;
  }

  scheduleUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    window.requestAnimationFrame(() => {
      this.update();
      this._updateScheduled = false;
    });
  }

  update() {}
}

const DraggableMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("mousedown", this.onMouseDown);
    }

    onMouseDown(ev) {
      const startPosition = this.getDragStartPosition();
      const dragStart = { x: ev.clientX, y: ev.clientY };

      const onMouseMove = (ev) => {
        const zoom = this.getZoom();
        const dx = (ev.clientX - dragStart.x) / zoom;
        const dy = (ev.clientY - dragStart.y) / zoom;
        this.onDragged(startPosition.x, startPosition.y, dx, dy);
      };
      document.addEventListener("mousemove", onMouseMove);

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mouseup", onMouseUp);

      ev.preventDefault();
      ev.stopPropagation();
    }

    getZoom() {
      return 1.0;
    }

    getDragStartPosition() {
      return { x: 0, y: 0 };
    }

    onDragged(sx, sy, dx, dy) {}
  };

class StickyNote extends DraggableMixin(BaseElement) {
  static observedAttributes = ["x", "y", "width", "height", "color"];

  static template = html`
    <style>
      :host {
        position: absolute;
        padding: 1em;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
      }
      :host .container {
      }
    </style>
    <div class="container">
      <slot></slot>
    </div>
  `;

  getZoom() {
    return parseFloat(this.parentElement.attributes.zoom.value);
  }

  getDragStartPosition() {
    return {
      x: parseInt(this.attributes.x.value),
      y: parseInt(this.attributes.y.value),
    };
  }

  onDragged(sx, sy, dx, dy) {
    this.attributes.x.value = sx + dx;
    this.attributes.y.value = sy + dy;
  }

  update() {
    const attrs = this.getObservedAttributes();

    this.style.left = `${attrs.x}px`;
    this.style.top = `${attrs.y}px`;
    this.style.width = `${attrs.width}px`;
    this.style.height = `${attrs.height}px`;
    this.style.backgroundColor = attrs.color;
  }
}
customElements.define("sticky-note", StickyNote);

class StickyNotesCanvas extends DraggableMixin(BaseElement) {
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
      /*
      .inner-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        padding: 0;
        margin: 0;
      }
      */
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
    this.maxZoom = 5.0;
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
    console.log(ev);
    this.zoomOrigin = { x: ev.clientX, y: ev.clientY };
    this.zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom + ev.deltaY * this.wheelFactor)
    );
  }

  getZoom() {
    return parseFloat(this.attributes.zoom.value);
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

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
