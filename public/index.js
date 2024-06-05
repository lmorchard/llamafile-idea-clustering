import { LitElement, html, render } from "./lib/vendor/lit-all.min.js";
import { llama } from "./completion.js";
import { items } from "./items.js";
import "./skmeans.js";

import "./lib/components/index.js";
import { $, $$, updateElement, createElement } from "./lib/dom.js";

const LLAMAFILE_BASE_URL = "http://127.0.0.1:8886";

const PROMPT_TEMPLATE = (system, user) => `<|system|>
  ${system}</s>
  <|user|>
  ${user}</s>
  <|assistant|>`;

const SYSTEM_PROMPT = "You are a helpful but terse assistant.";

const USER_PROMPT = (items) => `
  Please generate a succinct label that effectively encapsulates the overall theme
  or purpose for the following list of items:

  ${items.join("\n")}
  `;

const CLUSTER_LAYOUT_RADIUS = 1200;

async function main() {
  console.log("READY.");

  const props = await llamafileGET("props");
  console.log(`Model: ${props.default_generation_settings.model}`);

  const canvasEl = document.getElementById("notes-canvas");
  const itemsWithIds = items.map((item, idx) => ({
    id: `item-${idx + 1}`,
    item,
  }));

  for (const item of itemsWithIds) {
    canvasEl.appendChild(
      createElement("sticky-note", {
        id: item.id,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        ".innerHTML": `${item.item.substring(2)}`,
      })
    );
  }

  /*
  canvasEl.appendChild(
    createElement("sticky-notes-cluster-topic", {
      id: `cluster-main`,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      title: `unorganized`,
      color: `#eee`,
      children: itemsWithIds.map((item) =>
        createElement("sticky-notes-cluster-link", {
          href: `${item.id}`,
        })
      ),
    })
  );
  */

  canvasEl.addEventListener("reset", async () => resetNotes(canvasEl));
  canvasEl.addEventListener("organize", async () => {
    await resetNotes(canvasEl);
    await organizeNotes(canvasEl);
  });
}

async function resetNotes(canvasEl) {
  for (const link of canvasEl.querySelectorAll("sticky-notes-cluster-link")) {
    link.parentElement.removeChild(link);
  }
  for (const topic of canvasEl.querySelectorAll("sticky-notes-cluster-topic")) {
    topic.parentElement.removeChild(topic);
  }
}

async function organizeNotes(canvasEl) {
  const notes = canvasEl.querySelectorAll("sticky-note");
  const itemsWithIds = [];
  for (const note of notes) {
    itemsWithIds.push({
      id: note.id,
      item: note.innerText,
    });
  }

  console.log(itemsWithIds);

  const embeddingsResponse = await llamafile("embedding", { content: items });
  const embeddings = embeddingsResponse.results.map((r) => r.embedding);

  const { centroids, idxs } = skmeans(embeddings, 12);
  const clusters = centroids.map((_centroid, currIdx) =>
    idxs
      .map((idx, itemIdx) => idx === currIdx && itemsWithIds[itemIdx])
      .filter((x) => !!x)
  );

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];

    const prompt = PROMPT_TEMPLATE(
      SYSTEM_PROMPT,
      USER_PROMPT(cluster.map((item) => item.item))
    );
    const result = await llamafile("completion", {
      prompt,
      n_predict: 16,
      temperature: 0.1,
      top_k: 3,
      top_p: 0.9,
    });

    const clusterAngle = (i / clusters.length) * Math.PI * 2;
    const clusterX = Math.cos(clusterAngle) * CLUSTER_LAYOUT_RADIUS;
    const clusterY = Math.sin(clusterAngle) * (CLUSTER_LAYOUT_RADIUS / 2);

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
    canvasEl.appendChild(clusterGroupEl);
  }
}

async function llamafile(path, payload, method = "POST") {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (payload) {
    options.body = JSON.stringify(payload);
  }
  const resp = await fetch(`${LLAMAFILE_BASE_URL}/${path}`, options);
  return resp.json();
}

const llamafileGET = (path) => llamafile(path, undefined, "GET");
const llamafilePOST = (path) => llamafile(path, undefined, "POST");

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
