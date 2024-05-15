import { html } from "../dom.js";
import { StickyNotesCanvasChildDraggableMixin } from "../mixins/StickyNotesCanvasChildDraggableMixin.js";
import Springy from "../springy.js";

export class StickyNotesGroup extends StickyNotesCanvasChildDraggableMixin() {
  static observedAttributes = [
    ...StickyNotesCanvasChildDraggableMixin.observedAttributes,
    "color",
  ];

  static template = html`
    <style>
      :host {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
      }
      :host .container {
      }
    </style>
    <div class="container">
      <slot></slot>
      <span class="title"></span>
    </div>
  `;

  constructor() {
    super();

    this.scale = 100;
    this.lastTimeStamp = null;

    this.mutationObserver = new MutationObserver((records) =>
      this.handleMutations(records)
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.graph = new Springy.Graph();

    this.layout = new Springy.Layout.ForceDirected(
      this.graph,
      500.0, // Spring stiffness
      500.0, // Node repulsion
      0.5, // Damping
      0.05 // minEnergyThreshold
    );

    this.mainNode = new Springy.Node("main");
    this.graph.addNode(this.mainNode);

    this.mutationObserver.observe(this, {
      childList: true,
      subtree: false,
    });

    const children = Array.from(this.querySelectorAll("sticky-note"));
    this.updateGraphNodes(children);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
  }

  updateGraphNodes(toAdd = [], toRemove = []) {
    const mainNode = this.mainNode;

    for (const el of toAdd) {
      const id = el.getAttribute("id");
      if (id in this.graph.nodeSet) continue;

      const node = new Springy.Node(id);
      this.graph.addNode(node);

      const edgeId = `${id}-main`;
      const edge = new Springy.Edge(edgeId, node, mainNode, {});
      this.graph.addEdge(edge);
    }

    for (const node of toRemove) {
      const id = node.getAttribute("id");
      this.layout.removeNode({ id });

      const edgeId = `${id}-main`;
      this.graph.removeEdge({ id: edgeId });
    }

    this.startUpdatingGraph();
  }

  handleMutations(records) {
    const toAdd = [];
    const toRemove = [];

    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          toAdd.push(node);
        }
      }
      for (const node of record.removedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          toRemove.push(node);
        }
      }
    }

    this.updateGraphNodes(toAdd, toRemove);
  }

  startUpdatingGraph() {
    if (this._updating) return;
    this.timeStart = null;
    window.requestAnimationFrame((ts) => this.updateGraph(ts));
    this._updating = true;
  }

  stopUpdatingGraph() {
    this._updating = false;
  }

  updateGraph(timeStamp) {
    if (!this._updating) return;
    if (!this.lastTimeStamp) this.lastTimeStamp = timeStamp;

    const deltaTime = Math.max(0.001, (timeStamp - this.lastTimeStamp) / 1000);
    this.lastTimeStamp = timeStamp;

    const mainNode = this.mainNode;
    const mainPoint = this.layout.point(mainNode);
    mainPoint.p.x = 0;
    mainPoint.p.y = 0;

    this.layout.tick(deltaTime);
    this.updateChildrenFromGraph();

    if (this.layout.totalEnergy() < this.layout.minEnergyThreshold) {
      this.stopUpdatingGraph();
    }

    window.requestAnimationFrame((ts) => this.updateGraph(ts));
  }

  update() {
    super.update();

    this.$(".title").innerText = this.getAttribute("title");
  }

  updateChildrenFromGraph() {
    for (const [id, node] of Object.entries(this.graph.nodeSet)) {
      const point = this.layout.point(node);
      const el = this.ownerDocument.getElementById(id);
      if (!el) continue;

      el.attributes.x.value = point.p.x * this.scale;
      el.attributes.y.value = point.p.y * this.scale;
    }
  }
}

customElements.define("sticky-notes-group", StickyNotesGroup);
