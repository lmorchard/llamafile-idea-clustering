import "./lib/components/index.js";

async function main() {
  console.log("READY.");
}

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
