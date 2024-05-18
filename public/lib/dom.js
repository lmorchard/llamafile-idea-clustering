export const $ = (sel, context = document.body) =>
  typeof sel === "string" ? context.querySelector(sel) : sel;

export const $$ = (sel, context = document) =>
  Array.from(context.querySelectorAll(sel));

export const html = (strings, ...values) =>
  strings.map((string, i) => string + (values[i] || "")).join("");

export function clearChildren(sel, context = document.body) {
  let parentNode = $(sel, context);
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild);
  }
  return parentNode;
}

export function replaceChildren(sel, childNodes, context = document.body) {
  let parentNode = clearChildren(sel, context);
  for (let node of childNodes) {
    parentNode.appendChild(node);
  }
  return parentNode;
}

export function updateElement(el, elementUpdateSet) {
  if (typeof elementUpdateSet === "string") {
    el.textContent = elementUpdateSet;
  } else if (typeof elementUpdateSet === "function") {
    elementUpdateSet(el);
  } else {
    for (let [name, value] of Object.entries(elementUpdateSet)) {
      if (name.startsWith(">")) {
        el.addEventListener(name.substring(1), value);
      } else if (name.startsWith(".")) {
        el[name.substring(1)] = value;
      } else if (name === "children") {
        replaceChildren(el, value);
      } else {
        el.setAttribute(name, value);
      }
    }
  }
  return el;
}

export function createElement(name, changeSet = {}, context = document) {
  return updateElement(context.createElement(name), changeSet);
}

export class BaseElement extends HTMLElement {
  static observedAttributes = [];

  static template = html`<slot></slot>`;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(this.template());
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

  applyUpdates(selectorUpdateSet) {
    for (const sel in selectorUpdateSet) {
      const els = sel === ":host" ? [this] : $$(sel, this.shadowRoot);
      for (const el of els) {
        updateElement(el, selectorUpdateSet[sel]);
      }
    }
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
