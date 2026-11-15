/** Illustrative lab signal. Replace with the GitHub contributions API when a public handle is wired. */
export function buildActivity(): number[] {
  const cells: number[] = [];
  let seed = 20261115;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 53 * 7; i += 1) {
    const wave = Math.sin(i / 11) * 0.5 + 0.5;
    const weekend = i % 7 === 0 || i % 7 === 6 ? 0.45 : 1;
    const value = next() * wave * weekend;
    cells.push(value > 0.78 ? 4 : value > 0.58 ? 3 : value > 0.38 ? 2 : value > 0.18 ? 1 : 0);
  }
  return cells;
}

export const LAB_STACK = [
  { name: "Python", value: 34, color: "#00ff9d" },
  { name: "TypeScript", value: 26, color: "#00f3ff" },
  { name: "C++", value: 12, color: "#9aa4ff" },
  { name: "WebGL / 3D", value: 14, color: "#ff0055" },
  { name: "IA", value: 14, color: "#d6ff4a" },
];
