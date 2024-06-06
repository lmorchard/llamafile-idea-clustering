import { LitElement, html, css } from "../vendor/lit-all.min.js";
import { $, $$, updateElement, createElement } from "../dom.js";
import { items } from "../../items.js";
import { colors, randomColor } from "../colors.js";
import { llamafile } from "../llamafile.js";
import "../vendor/skmeans.js";

const DEFAULT_CLUSTER_LAYOUT_RADIUS = 1200;
const DEFAULT_NUM_CLUSTERS = 10;

const DEFAULT_SYSTEM_PROMPT = "You are a helpful but terse assistant.";

const DEFAULT_USER_PROMPT = `
Please generate a succinct label that effectively encapsulates the overall theme or purpose for the following list of items:

{{{items}}}
`.trim();

const DEFAULT_PROMPT_TEMPLATE = (promptSystem, promptUser, items) =>
  `<|system|>
${promptSystem}</s>
<|user|>
${promptUser}
</s>
<|assistant|>`.replace(
    "{{{items}}}",
    items.map((item) => `- ${item}`).join("\n")
  );

export class StickyNotesApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow: hidden;
    }
  `;

  constructor() {
    super();

    this.promptTemplate = DEFAULT_PROMPT_TEMPLATE;
    this.promptSystem = DEFAULT_SYSTEM_PROMPT;
    this.promptUser = DEFAULT_USER_PROMPT;
    this.llmParameters = {
      temperature: 0.1,
      top_k: 40,
      top_p: 0.95,
      min_p: 0.05,
      n_predict: 16,
      n_keep: 0,
      seed: -1,
    };
    this.uiOptions = {
      numClusters: DEFAULT_NUM_CLUSTERS,
      clusterLayoutRadius: DEFAULT_CLUSTER_LAYOUT_RADIUS,
    };
  }

  render() {
    return html`
      <sticky-notes-canvas
        zoom="0.5"
        originx="0"
        originy="0"
      ></sticky-notes-canvas>
      <sticky-notes-tweak-pane
        @demo-notes=${this.onDemoNotes}
        @clear-notes=${this.onClearNotes}
        @organize-notes=${this.onOrganize}
        @reset-topics=${this.onReset}
        @delete-note=${this.onDeleteNote}
        @add-note=${this.onAddNote}
      ></sticky-notes-tweak-pane>
    `;
  }

  prompt(items) {
    return this.promptTemplate(this.promptSystem, this.promptUser, items);
  }

  get canvas() {
    return this.shadowRoot.querySelector("sticky-notes-canvas");
  }

  async onDeleteNote() {
    const selected = this.canvas.selected;
    for (const link of this.canvas.querySelectorAll(
      `sticky-notes-cluster-link[href=${selected.id}]`
    )) {
      link.parentElement.removeChild(link);
    }
    selected.parentElement.removeChild(selected);
  }

  async onAddNote() {
    const now = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    const id = `item-${now}-${rand}`;
    const color = randomColor();

    this.insertNote(id, `New note ${rand}`, color);
  }

  async onDemoNotes() {
    const now = Date.now();
    const itemsWithIds = items.map((item, idx) => ({
      id: `item-${now}-${idx}`,
      item,
    }));
    for (const item of itemsWithIds) {
      this.insertNote(item.id, item.item.substring(2), randomColor());
    }
  }

  async insertNote(id, text, color) {
    this.canvas.appendChild(
      createElement("sticky-note", {
        id,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color,
        ".innerHTML": `${text}`,
      })
    );
  }

  async onReset() {
    await this.resetTopics();
  }

  async onOrganize() {
    await this.resetTopics();
    await this.organizeNotes();
  }

  async onClearNotes() {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      await this.clearNotes();
    }
  }

  async resetTopics() {
    for (const link of this.canvas.querySelectorAll(
      "sticky-notes-cluster-link"
    )) {
      link.parentElement.removeChild(link);
    }
    for (const topic of this.canvas.querySelectorAll(
      "sticky-notes-cluster-topic"
    )) {
      topic.parentElement.removeChild(topic);
    }
  }

  async clearNotes() {
    await this.resetTopics();
    for (const topic of this.canvas.querySelectorAll("sticky-note")) {
      topic.parentElement.removeChild(topic);
    }
  }

  async organizeNotes() {
    const notes = this.canvas.querySelectorAll("sticky-note");
    const itemsWithIds = [];
    for (const note of notes) {
      itemsWithIds.push({
        id: note.id,
        item: note.innerText,
      });
    }

    const embeddingsResponse = await llamafile("embedding", { content: items });
    const embeddings = embeddingsResponse.results.map((r) => r.embedding);

    const { centroids, idxs } = skmeans(embeddings, this.uiOptions.numClusters);
    const clusters = centroids.map((_centroid, currIdx) =>
      idxs
        .map((idx, itemIdx) => idx === currIdx && itemsWithIds[itemIdx])
        .filter((x) => !!x)
    );

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const prompt = this.prompt(cluster.map((item) => item.item));
      const result = await llamafile("completion", {
        prompt,
        ...this.llmParameters,
      });

      const clusterAngle = (i / clusters.length) * Math.PI * 2;
      const clusterX =
        Math.cos(clusterAngle) * this.uiOptions.clusterLayoutRadius;
      const clusterY =
        Math.sin(clusterAngle) * (this.uiOptions.clusterLayoutRadius / 2);

      for (const item of cluster) {
        const linkEl = document.querySelector(
          `sticky-notes-cluster-link[href="${item.id}"]`
        );
        if (linkEl) linkEl.parentElement.removeChild(linkEl);
      }

      const clusterGroupEl = createElement("sticky-notes-cluster-topic", {
        id: `cluster-${i}`,
        x: clusterX,
        y: clusterY,
        width: 350,
        height: 200,
        title: `${result.content.trim()}`,
        color: `#eee`,
        children: cluster.map((item) =>
          createElement("sticky-notes-cluster-link", {
            href: `${item.id}`,
          })
        ),
      });
      this.canvas.appendChild(clusterGroupEl);
    }
  }
}

customElements.define("sticky-notes-app", StickyNotesApp);
