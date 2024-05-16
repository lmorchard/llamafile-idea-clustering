import { html, BaseElement } from "../dom.js";
import { DraggableMixin } from "../mixins/DraggableMixin.js";
import Springy from "../springy.js";
import { StickyNotesClusterTopic, StickyNotesClusterLink } from "./StickyNotesClusterTopic.js";
import { StickyNote } from "./StickyNote.js";

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
    this._rendering = false;

    this.mutationObserver = new MutationObserver(this.handleMutations.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("wheel", this.onWheel);

    this.graph = new Springy.Graph();

    this.layout = new Springy.Layout.ForceDirected(
      this.graph,
      300.0, // Spring stiffness
      200.0, // Node repulsion
      0.5, // Damping
      0.01 // minEnergyThreshold
    );

    const layoutTick = this.layout.tick.bind(this.layout);
    this.layout.tick = (timestep) => {
      this.rendererBeforeTick(timestep);
      layoutTick(timestep);
    };

    this.renderer = new Springy.Renderer(
      this.layout,
      () => { }, // clear
      this.rendererDrawEdge.bind(this),
      this.rendererDrawNode.bind(this),
      () => { this.rendering = false },
      () => { this.rendering = true },
    );

    this.mainNode = new Springy.Node("main", { mass: 100000 });
    this.graph.addNode(this.mainNode);

    this.mutationObserver.observe(this, { childList: true, subtree: true });

    for (const noteEl of this.querySelectorAll("sticky-note")) {
      this.upsertGraphNode(noteEl);
    }
    for (const topicEl of this.querySelectorAll("sticky-notes-cluster-topic")) {
      this.addTopic(topicEl);
    }
  }

  rendererBeforeTick() {
    this.layout.eachNode((node, point) => {
      const el = this.ownerDocument.getElementById(node.id);
      if (!el) return;
      point.p.x = parseFloat(el.attributes.x.value) / this.graphLayoutScale;
      point.p.y = parseFloat(el.attributes.y.value) / this.graphLayoutScale;
    });
  }

  rendererDrawEdge(edge, fromPointP, toPointP) { }

  rendererDrawNode(node, pointP) {
    const el = this.ownerDocument.getElementById(node.id);
    if (!el || el.dragging) return;
    el.attributes.x.value = pointP.x * this.graphLayoutScale;
    el.attributes.y.value = pointP.y * this.graphLayoutScale;
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
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node instanceof StickyNotesClusterLink) {
          this.removeTopicLink(record.target, node);
        } else if (node instanceof StickyNotesClusterTopic) {
          this.graph.removeNode({ id: node.id });
        } else if (node instanceof StickyNote) {
          this.graph.removeNode({ id: node.id });
        }
      }
      for (const node of record.addedNodes) {
        if (node instanceof StickyNotesClusterLink) {
          this.addTopicLink(record.target, node);
        } else if (node instanceof StickyNotesClusterTopic) {
          this.addTopic(node);
        } else if (node instanceof StickyNote) {
          this.upsertGraphNode(node);
        }
      }
    }
  }

  addTopic(topicEl) {
    this.upsertGraphNode(topicEl);
    for (const linkEl of topicEl.querySelectorAll('sticky-notes-cluster-link')) {
      this.addTopicLink(topicEl, linkEl);
    }
  }

  addTopicLink(topicEl, linkEl) {
    const linkedId = linkEl.getAttribute("href");
    const linkedEl = this.ownerDocument.getElementById(linkedId);
    if (!linkedEl) return;
    let linkedNode = this.upsertGraphNode(linkedEl);
    this.upsertGraphEdge(topicEl.id, linkedNode.id);
  }

  removeTopicLink(topicEl, linkEl) {
    const linkedId = linkEl.getAttribute("href");
    const edgeId = `${topicEl.id}-${linkedId}`;
    let edge = this.graph.edges.find((e) => e.id === edgeId);
    if (edge) this.graph.removeEdge(edge);
  }

  upsertGraphNode(nodeEl) {
    const nodeId = nodeEl.getAttribute("id");
    let node = this.graph.nodeSet[nodeId];
    if (!node) {
      const mass = (nodeEl.tagName === "STICKY-NOTES-CLUSTER-TOPIC") ? 10000 : 1;
      const x = parseFloat(nodeEl.attributes.x.value) / this.graphLayoutScale;
      const y = parseFloat(nodeEl.attributes.y.value) / this.graphLayoutScale;
      node = new Springy.Node(nodeId, { mass, x, y });
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
  }

}

customElements.define("sticky-notes-canvas", StickyNotesCanvas);
