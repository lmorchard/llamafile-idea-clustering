export const colors = [
  {
    name: "Pastel Pink",
    hex: "#FFD1DC",
    rgb: "rgb(255, 209, 220)",
  },
  {
    name: "Pastel Blue",
    hex: "#AEC6CF",
    rgb: "rgb(174, 198, 207)",
  },
  {
    name: "Pastel Green",
    hex: "#77DD77",
    rgb: "rgb(119, 221, 119)",
  },
  {
    name: "Pastel Yellow",
    hex: "#FDFD96",
    rgb: "rgb(253, 253, 150)",
  },
  {
    name: "Pastel Purple",
    hex: "#C3B1E1",
    rgb: "rgb(195, 177, 225)",
  },
  {
    name: "Pastel Orange",
    hex: "#FFB347",
    rgb: "rgb(255, 179, 71)",
  },
  {
    name: "Pastel Red",
    hex: "#FF6961",
    rgb: "rgb(255, 105, 97)",
  },
  {
    name: "Pastel Teal",
    hex: "#99C5C4",
    rgb: "rgb(153, 197, 196)",
  },
  {
    name: "Pastel Lavender",
    hex: "#C9A0DC",
    rgb: "rgb(201, 160, 220)",
  },
  {
    name: "Pastel Peach",
    hex: "#FFDAB9",
    rgb: "rgb(255, 218, 185)",
  },
];

export const randomColor = () =>
  colors[Math.floor(Math.random() * colors.length)].rgb;

export default colors;
