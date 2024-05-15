import { $, $$, updateElement, createElement } from "./lib/dom.js";
import "./lib/components/index.js";
import Springy from "./lib/springy.js";
import { items } from "./items.js";

async function main() {
  console.log("READY.");

  const notesCanvas = document.getElementById("notes-canvas");

  // an array of 16 different pale pastel colors
  const colors = [
    "#FADADD",
    "#FCE2E6",
    "#FEEAF0",
    "#FFF3F7",
    "#F8E2F1",
    "#F1D9EB",
    "#EACFF5",
    "#E3C6FF",
    "#DABDFF",
    "#D2B4FF",
    "#C9ABFF",
    "#C1A2FF",
    "#B898FF",
    "#AF8FFF",
    "#A686FF",
    "#9D7DFF",
  ];

  const minX = -400;
  const maxX = 400;
  const minY = -400;
  const maxY = 400;

  if (false) {
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const note = createElement("sticky-note", {
        "id": `note-${idx}`,
        "x": Math.random() * (maxX - minX) + minX,
        "y": Math.random() * (maxY - minY) + minY,
        "color": colors[Math.floor(Math.random() * colors.length)],
        ".innerHTML": item.substring(2),
      });
      notesCanvas.appendChild(note);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => main().catch(console.error));
