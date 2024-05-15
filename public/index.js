import { llama } from "./completion.js";
import { items } from "./items.js";
import "./skmeans.js";

import "./lib/components/index.js";
import { $, $$, updateElement } from "./lib/dom.js";

const LLAMAFILE_BASE_URL = "http://127.0.0.1:8886";

const PROMPT_TEMPLATE = (system, user) => `<|system|>
  ${system}</s>
  <|user|>
  ${user}</s>
  <|assistant|>`;

const SYSTEM_PROMPT = "You are a helpful but terse assistant.";

const USER_PROMPT = (items) => `
  Please generate a succinct label that effectively encapsulates the overall theme or purpose for the following list of items:

  ${items.join("\n")}

  Please generate a concise, descriptive label for this list. Thanks in advance!
  `;

async function main() {
  console.log("READY.");

  const notesCanvas = document.getElementById("notes-canvas");

  const props = await llamafileGET("props");
  console.log(`Model: ${props.default_generation_settings.model}`);

  const embeddingsResponse = await llamafile("embedding", { content: items });
  const embeddings = embeddingsResponse.results.map((r) => r.embedding);

  const { centroids, idxs } = skmeans(embeddings, 12);
  const clusters = centroids.map((_centroid, currIdx) =>
    idxs
      .map((idx, itemIdx) => idx === currIdx && items[itemIdx])
      .filter((x) => !!x)
  );
  console.log(clusters);

  const canvasEl = document.getElementById("notes-canvas");

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];

    const prompt = PROMPT_TEMPLATE(SYSTEM_PROMPT, USER_PROMPT(cluster));
    const result = await llamafile("completion", {
      prompt,
      n_predict: 16,
    });
    console.log(result);

    const clusterGroupEl = document.createElement("sticky-notes-group");
    clusterGroupEl.updateElement({
      "@id": `cluster-${i}`,
      "@x": Math.random() * 500 - 250,
      "@y": Math.random() * 500 - 250,
      "@title": `${result.content}`,
      "@color": `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });
    canvasEl.appendChild(clusterGroupEl);

    for (let j = 0; j < cluster.length; j++) {
      const noteEl = document.createElement("sticky-note");
      noteEl.updateElement({
        "@id": `note-${j}`,
        "@x": Math.random() * 200 - 100,
        "@y": Math.random() * 200 - 100,
        "@color": `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        innerHTML: cluster[j].substring(2),
      });
      clusterGroupEl.appendChild(noteEl);
    }
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
