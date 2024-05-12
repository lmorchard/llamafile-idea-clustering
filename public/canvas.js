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

    getZoom() {
      return parseFloat(this.attributes.zoom.value);
    }

    getDragStartPosition() {
      return {
        x: parseInt(this.attributes.x.value),
        y: parseInt(this.attributes.y.value),
      };
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
    const props = this.getObservedAttributes();

    this.style.left = `${props.x}px`;
    this.style.top = `${props.y}px`;
    this.style.width = `${props.width}px`;
    this.style.height = `${props.height}px`;
    this.style.backgroundColor = props.color;
  }
}
customElements.define("sticky-note", StickyNote);

class StickyNotesCanvas extends DraggableMixin(BaseElement) {
  static observedAttributes = [
    "originX",
    "originY",
    "zoom",
    "min-zoom",
    "max-zoom",
    "wheel-factor",
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
      }
      .inner-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        padding: 0;
        margin: 0;
        transform: translate(50%, 50%);
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

    this.document = null;
    this.minZoom = 0.1;
    this.maxZoom = 5.0;
    this.wheelFactor = 0.001;
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
    this.zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom + ev.deltaY * this.wheelFactor)
    );
  }

  getDragStartPosition() {
    return {
      x: parseInt(this.attributes.originX.value),
      y: parseInt(this.attributes.originY.value),
    };
  }

  onDragged(sx, sy, dx, dy) {
    this.attributes.originX.value = sx - dx;
    this.attributes.originY.value = sy - dy;
    this.update();
    console.log("onDragged", sx, sy, dx, dy);
  }

  update() {
    const attrs = this.getObservedAttributes();
    const zoom = parseFloat(attrs.zoom);
    const originX = parseFloat(attrs.originX);
    const originY = parseFloat(attrs.originY);

    const innerCanvas = this.shadowRoot.querySelector(".inner-canvas");
    innerCanvas.style.transform = `
      scale(${zoom})
      translate(${0 - originX}px, ${0 - originY}px)
    `;
  }
}
customElements.define("sticky-notes-canvas", StickyNotesCanvas);

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
