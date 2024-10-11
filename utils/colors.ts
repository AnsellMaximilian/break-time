const PINATA_COLORS: string[] = [
  "bg-[#FFDD00] text-black",
  "bg-[#1DB9D2] text-white",
  "bg-[#CE3F8F] text-white",
  "bg-[#6D3AC6] text-white",
];

export function getColorScheme(index: number) {
  const colorIndex = index % PINATA_COLORS.length;
  const colorScheme = PINATA_COLORS[colorIndex];

  return colorScheme;
}
