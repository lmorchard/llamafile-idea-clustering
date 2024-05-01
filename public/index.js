import { llama } from "./completion.js";
import "./skmeans.js";

const LLAMAFILE_BASE_URL = "http://127.0.0.1:8886";

const PROMPT_TEMPLATE = (system, user) => `<|system|>
${system}</s>
<|user|>
${user}</s>
<|assistant|>`;

const SYSTEM_PROMPT = "You are a helpful but terse assistant.";

const USER_PROMPT = (items) => `
I need a succinct label that effectively encapsulates the overall theme or purpose for the following list of items:

${items.join("\n")}

Please generate a concise, descriptive label for this list. Thanks in advance!`;

const items = `
- pasta
- thomas dolby
- alpha
- apples
- cats
- pears
- meters
- brick
- dogs
- beta
- howard jones
- concrete
- asphalt
- milk
- rebar
- gillian gilbert
- hamsters
- bread
- butter
- wendy carlos
- gamma
- birds
- bananas
- rick wakeman
- inches
- glass
- feet
- gary numan
- miles
- lumber
- kilometers
- geoff downes
`
  .split(/\n/)
  .filter((x) => !!x);

async function main() {
  console.log("READY");

  const props = await llamafileGET("props");
  console.log(props);

  const embeddingsResponse = await llamafile("embedding", { content: items });
  const embeddings = embeddingsResponse.results.map(r => r.embedding);
  console.log(embeddings);

  const clusteringResult = skmeans(embeddings, 12);
  const clusters = [];
  for (let i = 0; i < clusteringResult.centroids.length; i++) {
    const cluster = [];
    for (let j = 0; j < clusteringResult.idxs.length; j++) {
      if (clusteringResult.idxs[j] === i) {
        cluster.push(items[j]);
      }
    }
    clusters.push(cluster);
  }
  console.log(clusters);

  const app_el = document.getElementById("app");
  app_el.innerHTML = "";

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];

    const prompt = PROMPT_TEMPLATE(SYSTEM_PROMPT, USER_PROMPT(cluster));
    const result = await llamafile("completion", {
      prompt,
      n_predict: 16,
    });
    console.log(result);

    app_el.innerHTML += `<h2>${result.content}</h2>`;
    app_el.innerHTML += `<ul>`;
    for (let j = 0; j < cluster.length; j++) {
      app_el.innerHTML += `<li>${cluster[j]}</li>`;
    }
    app_el.innerHTML += `</ul>`;
  }

  /*
  */
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
