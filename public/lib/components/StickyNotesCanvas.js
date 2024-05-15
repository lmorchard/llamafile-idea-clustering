import { html, BaseElement } from "../dom.js";
import { DraggableMixin } from "../mixins/DraggableMixin.js";
import Springy from "../springy.js";

export class StickyNotesCanvas extends DraggableMixin(BaseElement) {
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
    this.maxZoom = 5;
    this.wheelFactor = 0.001;
    this.zoomOrigin = { x: 0, y: 0 };

    this.graphLayoutScale = 50;
    this.lastTimeStamp = null;

    this.mutationObserver = new MutationObserver((records) =>
      this.handleMutations(records)
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("wheel", this.onWheel);
    this.graph = new Springy.Graph();

    this.layout = new Springy.Layout.ForceDirected(
      this.graph,
      1000.0, // Spring stiffness
      2500.0, // Node repulsion
      0.75, // Damping
      0.01 // minEnergyThreshold
    );

    this.mainNode = new Springy.Node("main");
    this.graph.addNode(this.mainNode);

    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true,
    });

    const children = Array.from(
      this.querySelectorAll("sticky-notes-cluster-topic")
    );
    this.updateGraphNodes(children);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
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
    const container = this.$(".container");
    const innerCanvas = this.$(".inner-canvas");

    const parentHalfWidth = parentEl.clientWidth / 2;
    const parentHalfHeight = parentEl.clientHeight / 2;

    const translateX = parentHalfWidth - originX;
    const translateY = parentHalfHeight - originY;

    container.style.transformOrigin = `${parentHalfWidth}px ${parentHalfHeight}px`;

    container.style.transform = `
      scale(${zoom})
      translate(${translateX}px, ${translateY}px)
    `;
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

  updateGraphNodes(toAdd = [], toRemove = []) {
    const mainNode = this.mainNode;

    for (const addEl of toAdd) {

      let addNode = this.upsertGraphNode(addEl);
      if (addEl.tagName === "STICKY-NOTE") {
        // HACK add default edge to main center node
        this.upsertGraphEdge(addNode.id, mainNode.id);
      }

      if (addEl.tagName === "STICKY-NOTES-CLUSTER-TOPIC") {
        const linkEls = addEl.querySelectorAll("sticky-notes-cluster-link");
        for (const linkEl of linkEls) {
          const linkedId = linkEl.getAttribute("href");
          const linkedEl = this.ownerDocument.getElementById(linkedId);
          if (!linkedEl) continue;

          let linkedNode = this.upsertGraphNode(linkedEl);
          this.upsertGraphEdge(addNode.id, linkedNode.id);
        }
      }
    }

    for (const node of toRemove) {
      const topicId = node.getAttribute("id");
      this.graph.removeNode({ id: topicId });
    }

    this.startUpdatingGraph();
  }

  upsertGraphNode(nodeEl) {
    const nodeId = nodeEl.getAttribute("id");
    let node = this.graph.nodeSet[nodeId];
    if (!node) {
      node = new Springy.Node(nodeId);
      this.graph.addNode(node);
    }
    return node;
  }

  upsertGraphEdge(fromId, toId) {
    const edgeId = `${fromId}-${toId}`;
    let edge = this.graph.edges.find((e) => e.id === edgeId);
    if (!edge) {
      const fromNode = this.graph.nodeSet[fromId];
      const toNode = this.graph.nodeSet[toId];
      edge = new Springy.Edge(edgeId, fromNode, toNode, {});
      this.graph.addEdge(edge);
    }

    // HACK: remove default edge to main
    const mainEdgeId = `${toId}-main`;
    const mainEdge = this.graph.edges.find((e) => e.id === mainEdgeId);
    if (mainEdge) {
      this.graph.removeEdge(mainEdge);
    }
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

    // HACK: force the main node to stay at the origin
    const mainNode = this.mainNode;
    const mainPoint = this.layout.point(mainNode);
    mainPoint.p.x = 0;
    mainPoint.p.y = 0;

    this.updateLayoutFromChildren();
    this.layout.tick(deltaTime);
    this.updateChildrenFromLayout();

    if (this.layout.totalEnergy() < this.layout.minEnergyThreshold) {
      this.stopUpdatingGraph();
    }

    window.requestAnimationFrame((ts) => this.updateGraph(ts));
  }

  updateLayoutFromChildren() {
    for (const [id, node] of Object.entries(this.graph.nodeSet)) {
      const point = this.layout.point(node);
      const el = this.ownerDocument.getElementById(id);
      if (!el) continue;

      if (el.tagName === "STICKY-NOTES-CLUSTER-TOPIC") {
        point.m = 10000;
      } else {
        point.m = 1;
      }

      point.p.x = parseFloat(el.attributes.x.value) / this.graphLayoutScale;
      point.p.y = parseFloat(el.attributes.y.value) / this.graphLayoutScale;
    }
  }

  updateChildrenFromLayout() {
    for (const [id, node] of Object.entries(this.graph.nodeSet)) {
      const point = this.layout.point(node);
      const el = this.ownerDocument.getElementById(id);
      if (!el) continue;
      if (el.dragging) continue;

      el.attributes.x.value = point.p.x * this.graphLayoutScale;
      el.attributes.y.value = point.p.y * this.graphLayoutScale;
    }
  }
}

customElements.define("sticky-notes-canvas", StickyNotesCanvas);
