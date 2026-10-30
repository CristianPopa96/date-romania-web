// A squarified treemap: rectangles whose areas are proportional to their values, kept as
// close to squares as the values allow (Bruls, Huizing and van Wijk). Values are laid out
// largest first; each rectangle is in percent of the whole, so the map scales with its
// box.

export type Tile = { x: number; y: number; width: number; height: number }

// The worst ratio of a row's rectangles laid along a side of length `side`.
function worst(row: Array<number>, side: number): number {
  const sum = row.reduce((a, b) => a + b, 0)
  const largest = Math.max(...row)
  const smallest = Math.min(...row)
  return Math.max(
    (side * side * largest) / (sum * sum),
    (sum * sum) / (side * side * smallest),
  )
}

// The tiles of `values` (each > 0, in the order given, which should be largest first) in
// a box of `width` by `height`.
export function squarify(
  values: ReadonlyArray<number>,
  width = 100,
  height = 100,
): Array<Tile> {
  const total = values.reduce((a, b) => a + b, 0)
  if (!values.length || total <= 0) return []
  const scale = (width * height) / total
  const areas = values.map((value) => value * scale)
  const tiles: Array<Tile> = []
  let box = { x: 0, y: 0, width, height }
  let row: Array<number> = []
  let i = 0
  while (i < areas.length) {
    const side = Math.min(box.width, box.height)
    const next = [...row, areas[i]]
    if (row.length === 0 || worst(next, side) <= worst(row, side)) {
      row = next
      i += 1
      continue
    }
    box = layRow(row, box, tiles)
    row = []
  }
  if (row.length) layRow(row, box, tiles)
  return tiles
}

// Lays one row along the shorter side of the box; returns what is left of the box.
function layRow(
  row: Array<number>,
  box: { x: number; y: number; width: number; height: number },
  tiles: Array<Tile>,
) {
  const sum = row.reduce((a, b) => a + b, 0)
  if (box.width >= box.height) {
    // A column on the left, as wide as the row needs.
    const width = sum / box.height
    let y = box.y
    for (const area of row) {
      const height = area / width
      tiles.push({ x: box.x, y, width, height })
      y += height
    }
    return { ...box, x: box.x + width, width: box.width - width }
  }
  // A row along the top.
  const height = sum / box.width
  let x = box.x
  for (const area of row) {
    const width = area / height
    tiles.push({ x, y: box.y, width, height })
    x += width
  }
  return { ...box, y: box.y + height, height: box.height - height }
}
