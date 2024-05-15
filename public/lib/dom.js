// subset copypasta'd from https://github.com/lmorchard/lmorchard-scenes/blob/6e60f3ddf45f8988e5225c6bb772265130991a03/web_modules/dom.js

export const $ = (sel, context = document.body) =>
  typeof sel === "string" ? context.querySelector(sel) : sel;

export const $$ = (sel, context = document) =>
  Array.from(context.querySelectorAll(sel));

export const html = (strings, ...values) =>
  strings.map((string, i) => string + (values[i] || "")).join("");

export function updateElement(el, changeSet) {
  if (typeof changeSet === "string") {
    el.textContent = changeSet;
  } else if (typeof changeSet === "function") {
    changeSet(el);
  } else {
    for (const name in changeSet) {
      const value = changeSet[name];
      if (name.startsWith("@")) {
        el.setAttribute(name.substring(1), value);
      } else if (name.startsWith(">")) {
        el.addEventListener(name.substring(1), value);
      } else if (name === "children") {
        replaceChildren(el, value);
      } else {
        el[name] = value;
      }
    }
  }
  return el;
}

export function updateElements(changes = [], context = document.body) {
  for (const sel in changes) {
    for (const el of $$(sel, context)) {
      updateElement(el, changes[sel]);
    }
  }
}
export class BaseElement extends HTMLElement {
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

  $(sel) {
    return $(sel, this.shadowRoot);
  }

  $$(sel) {
    return $$(sel, this.shadowRoot);
  }

  updateElement(changeSet) {
    updateElement(this, changeSet);
  }

  updateShadowRoot(changeSet) {
    updateElements(this.shadowRoot, changeSet);
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
