import { $$ } from "../dom.js";
import Springy from "../springy.js";
import {
  StickyNotesClusterTopic,
  StickyNotesClusterLink
} from "../components/StickyNotesClusterTopic.js";
import { StickyNote } from "../components/StickyNote.js";

export const GraphLayoutMixin = (Base) => class extends Base {
  constructor() {
    super();

    this.graphLayoutScale = 50;
    this._rendering = false;

    this.mutationObserver = new MutationObserver(
      this.handleMutations.bind(this)
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.graph = new Springy.Graph();

    this.layout = new Springy.Layout.ForceDirected(
      this.graph,
      300, // Spring stiffness
      200, // Node repulsion
      0.5, // Damping
      0.5 // minEnergyThreshold
    );

    // HACK: wedge in a handler to fire just before layout tick
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
      () => {
        this.rendering = false;
      },
      () => {
        this.rendering = true;
      }
    );

    this.mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      subtree: true,
    });

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

  handleMutations(records) {
    for (const record of records) {
      if (record.type == "attributes") {
        if (!this.rendering) this.renderer.start();
      } else if (record.type == "childList") {
        // TODO: make these more generic types for entity / link / cluster?
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
  }

  addTopic(topicEl) {
    this.upsertGraphNode(topicEl);
    for (const linkEl of $$("sticky-notes-cluster-link", topicEl)) {
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
      const mass = nodeEl.tagName === "STICKY-NOTES-CLUSTER-TOPIC" ? 10000 : 1;
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
};

GraphLayoutMixin.observedAttributes = [];
