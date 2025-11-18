import crypto from "crypto";

export function seededRandom(seed: string) {
  let counter = 0;
  return function () {
    const hash = crypto
      .createHash("sha256")
      .update(seed + counter++)
      .digest("hex");
    const int = parseInt(hash.slice(0, 8), 16);
    return int / 0xffffffff;
  };
}

export function shuffleArraySeeded<T>(
  array: T[],
  seed: string
): { shuffled: T[]; map: number[] } {
  const rng = seededRandom(seed);  
  const arr = [...array];
  const map = Array.from({ length: arr.length }, (_, i) => i + 1);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    [map[i], map[j]] = [map[j]!, map[i]!];
  }

  return { shuffled: arr, map };
}


export function reverseMap(map: number[]): number[] {
  const reversed = Array(map.length);
  for (let i = 0; i < map.length; i++) {
    reversed[map[i] - 1] = i + 1; // reverse mapping
  }
  return reversed;
}
