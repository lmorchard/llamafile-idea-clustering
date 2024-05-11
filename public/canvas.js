async function main() {
  console.log("READY.");
}

const html = (strings, ...values) =>
  strings.map((string, i) => string + (values[i] || "")).join("");

class BaseElement extends HTMLElement {
  static templateSource = html`<slot></slot>`;

  constructor() {
    super();
    const template = this.getTemplate();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.cloneNode(true));
  }

  getTemplate() {
    const template = this.ownerDocument.createElement("template");
    template.innerHTML = this.constructor.templateSource;
    return template.content.cloneNode(true);
  }
}

class StickyNote extends BaseElement {
  static observedAttributes = ["x", "y", "width", "height", "color"];

  static templateSource = html`
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

  constructor() {
    super();

    this.dragging = false;
  }

  connectedCallback() {
    this.updateStyles();

    this.addEventListener("mousedown", this.onMouseDown);
  }

  get zoom() {
    return parseFloat(this.parentElement.attributes.zoom.value);
  }

  onMouseDown(ev) {
    this.dragStart = { x: ev.clientX, y: ev.clientY };
    this.startPos = {
      x: parseInt(this.attributes.x.value),
      y: parseInt(this.attributes.y.value),
    };

    const onMouseMove = (ev) => {
      const zoom = this.zoom;
      const dx = (ev.clientX - this.dragStart.x) / zoom;
      const dy = (ev.clientY - this.dragStart.y) / zoom;
      const newX = this.startPos.x + dx;
      const newY = this.startPos.y + dy;
      this.attributes.x.value = newX;
      this.attributes.y.value = newY;
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateStyles();
    }
  }

  getProps() {
    const props = {};
    for (const name of this.constructor.observedAttributes) {
      props[name] = this.getAttribute(name);
    }
    return props;
  }

  updateStyles() {
    window.requestAnimationFrame(() => {
      const props = this.getProps();

      this.style.left = `${props.x}px`;
      this.style.top = `${props.y}px`;
      this.style.width = `${props.width}px`;
      this.style.height = `${props.height}px`;
      this.style.backgroundColor = props.color;
    });
  }
}
customElements.define("sticky-note", StickyNote);

class StickyNotesCanvas extends BaseElement {
  static observedAttributes = ["zoom", "min-zoom", "max-zoom", "wheel-factor"];

  static templateSource = html`
    <style>
      :host {
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        box-sizing: border-box;
        width: 100vw;
        height: 100vh;
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
    this.updateZoom();
  }

  connectedCallback() {
    this.addEventListener("wheel", this.onWheel);
    this.updateZoom();
    this.addEventListener("mousemove", this.onMouseMove);
  }

  onMouseMove(ev) {}

  onWheel(ev) {
    ev.preventDefault();
    this.zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.zoom + ev.deltaY * this.wheelFactor)
    );
  }

  updateZoom() {
    const zoom = parseFloat(this.attributes.zoom.value);

    const container = this.shadowRoot.querySelector(".container");
    const innerCanvas = this.shadowRoot.querySelector(".inner-canvas");
    innerCanvas.style.transform = `
      scale(${zoom})
      translate(50%, 50%)
    `;
  }
}
customElements.define("sticky-notes-canvas", StickyNotesCanvas);

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
