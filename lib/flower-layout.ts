import type { FlowerParams } from "@/lib/flower-params";

const CENTER_X = 160;
const CENTER_Y_BOTTOM = 225;
const STEM_TOP_Y = 90;
const STEM_HEIGHT = CENTER_Y_BOTTOM - STEM_TOP_Y;

export type FlowerPosition = { x: number; y: number; delay: number; isFocal: boolean };
export type BranchPath = { path: string; delay: number };
export type LeafNode = { sx: number; sy: number; rotation: number; delay: number; scale?: number };

function deg(angle: number): number {
  return (angle * Math.PI) / 180;
}

function branchEnd(
  startX: number,
  startY: number,
  angleDeg: number,
  length: number
): { x: number; y: number } {
  const rad = deg(angleDeg);
  return {
    x: startX + length * Math.sin(rad),
    y: startY - length * Math.cos(rad),
  };
}

/** Soft random-ish offset using seed-friendly hash (deterministic per index) */
function vary(base: number, range: number, index: number): number {
  const t = Math.sin(index * 1.7) * 0.5 + Math.cos(index * 2.3) * 0.5;
  return base + range * (t * 2 - 1);
}

/**
 * Cluster shape: soft triangular or oval, flowers overlap (bouquet feel).
 * Tighter spread for natural overlap; avoid diagram-like separation.
 */
function clusterPoints(
  cx: number,
  cy: number,
  count: number,
  spread: number,
  index: number,
  tiltUp = 0
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const baseAngle = index * 37;
  if (count === 1) {
    points.push({ x: cx, y: cy });
    return points;
  }
  if (count === 2) {
    const angle = deg(baseAngle);
    const s = spread * 0.55;
    points.push(
      { x: cx - s * Math.cos(angle), y: cy + s * 0.6 * Math.sin(angle) - tiltUp },
      { x: cx + s * 0.9 * Math.cos(angle), y: cy - s * 0.5 * Math.sin(angle) - tiltUp }
    );
    return points;
  }
  // 3 flowers: soft triangle, tight overlap
  for (let i = 0; i < 3; i++) {
    const a = deg(baseAngle + i * 120 + vary(0, 12, index + i));
    const r = spread * (0.55 + vary(0, 0.15, index + i * 2));
    points.push({
      x: cx + r * Math.cos(a),
      y: cy - r * Math.sin(a) - tiltUp,
    });
  }
  return points;
}

/**
 * Junction = centroid of flowers, pulled only slightly toward stem.
 * Short twigs so flowers overlap and hide junctions (supportive, not structural).
 */
function junctionPoint(points: { x: number; y: number }[], stemX: number, stemY: number): { x: number; y: number } {
  const n = points.length;
  const cx = points.reduce((s, p) => s + p.x, 0) / n;
  const cy = points.reduce((s, p) => s + p.y, 0) / n;
  const dx = stemX - cx;
  const dy = stemY - cy;
  const len = Math.hypot(dx, dy);
  if (len < 1) return { x: cx, y: cy };
  const pull = Math.min(2, len * 0.04); // minimal pull → shorter twigs
  return {
    x: cx + (dx / len) * pull,
    y: cy + (dy / len) * pull,
  };
}

/**
 * Refined plant layout:
 * - Every flower at a branch endpoint; branches stop at flower centers
 * - Asymmetric: varied heights, offset left/right, no mirroring
 * - Clusters: soft triangular/oval, overlapping flowers
 * - Stem balance: leaves below main cluster
 */
export function computeFlowerLayout(params: FlowerParams): {
  flowers: FlowerPosition[];
  branches: BranchPath[];
  leaves: LeafNode[];
} {
  const { branchCount, spreadWidth } = params;
  const baseDelay = 1.5;
  const scale = Math.min(1.15, 0.9 + spreadWidth / 350);

  const flowers: FlowerPosition[] = [];
  const branches: BranchPath[] = [];

  const levelCount = Math.min(Math.max(2, branchCount), 4);

  // Soft arc silhouette: center highest (apex), left/right gently descending
  // Flower balance: left cluster 3, right cluster 2 (top/mid); left shifted upward
  const baseLevels = [
    { frac: 0.35, angle: 32, length: 52, clusterSize: (s: number) => (s === 0 ? 2 : s === -1 ? 3 : 2) },
    { frac: 0.5, angle: 26, length: 42, clusterSize: (s: number) => (s === 0 ? 2 : s === -1 ? 3 : 2) },
    { frac: 0.65, angle: 18, length: 32, clusterSize: () => 2 },
  ].slice(0, levelCount);

  let firstFocal = true;
  let globalIndex = 0;

  for (let level = 0; level < baseLevels.length; level++) {
    const bl = baseLevels[level];
    const isTop = level === 0;
    const branchDelay = baseDelay + level * 0.08;

    // Arc: center apex (-5), left slightly lower (-2), right cascades down (+4)
    const sides: { sign: number; fracAdj: number; angleAdj: number; vertOffset: number; tiltUp: number }[] = isTop
      ? [
          { sign: 0, fracAdj: 0, angleAdj: 0, vertOffset: -5, tiltUp: 0 },
          { sign: -1, fracAdj: 0.04, angleAdj: 3, vertOffset: -2, tiltUp: 3 },
          { sign: 1, fracAdj: -0.05, angleAdj: -4, vertOffset: 6, tiltUp: 0 },
        ]
      : [
          { sign: -1, fracAdj: 0.04, angleAdj: 2, vertOffset: -1, tiltUp: 2 },
          { sign: 1, fracAdj: -0.06, angleAdj: -3, vertOffset: 5, tiltUp: 0 },
        ];

    for (const { sign, fracAdj, angleAdj, vertOffset, tiltUp } of sides) {
      const frac = bl.frac + vary(fracAdj, 0.03, globalIndex);
      const nodeY = STEM_TOP_Y + frac * STEM_HEIGHT + vertOffset;
      const angle = sign * (bl.angle + angleAdj) * scale;
      const len = bl.length * scale * (1 + vary(0, 0.06, globalIndex + 1));

      const primaryEnd = branchEnd(CENTER_X, nodeY, angle, len);

      const clusterSize = bl.clusterSize(sign);
      const clusterSpread = (bl.length * 0.24) * scale; // tighter for overlap
      const pts = clusterPoints(primaryEnd.x, primaryEnd.y, clusterSize, clusterSpread, globalIndex, tiltUp);
      const junction = junctionPoint(pts, CENTER_X, nodeY);

      // Primary branch: stem -> junction (stops before flowers)
      const ctrlX = CENTER_X + (junction.x - CENTER_X) * 0.45;
      const ctrlY = nodeY + (junction.y - nodeY) * 0.35;
      branches.push({
        path: `M ${CENTER_X} ${nodeY} Q ${ctrlX} ${ctrlY} ${junction.x} ${junction.y}`,
        delay: branchDelay + (sign !== 0 ? 0.015 : 0),
      });

      // Twigs: junction -> flower center (branch ends exactly at flower)
      const flowerDelay = 2.8 + level * 0.1 + Math.abs(sign) * 0.02;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const twigCtrlX = junction.x + (p.x - junction.x) * 0.5;
        const twigCtrlY = junction.y + (p.y - junction.y) * 0.5;
        branches.push({
          path: `M ${junction.x} ${junction.y} Q ${twigCtrlX} ${twigCtrlY} ${p.x} ${p.y}`,
          delay: branchDelay + 0.05 + i * 0.02,
        });
        flowers.push({
          x: p.x,
          y: p.y,
          delay: flowerDelay + 0.05 + i * 0.03,
          isFocal: firstFocal && level === 0 && sign === 0 && i === 0,
        });
      }
      if (firstFocal && sign === 0) firstFocal = false;
      globalIndex += 3;
    }
  }

  // Leaves along stem, fewer and closer to stem (not straying out)
  const leafFracs: { frac: number; scale: number }[] = [
    { frac: 0.55, scale: 1 },
    { frac: 0.72, scale: 0.9 },
  ];
  const leafOffset = 2; // keep leaves near stem
  const leaves: LeafNode[] = leafFracs.flatMap(({ frac, scale }, i) => {
    const sy = STEM_TOP_Y + frac * STEM_HEIGHT;
    return [
      { sx: CENTER_X - leafOffset, sy, rotation: -22 - i * 3 + vary(0, 3, i), delay: 2 + i * 0.035, scale },
      { sx: CENTER_X + leafOffset, sy, rotation: 22 + i * 3 + vary(0, 3, i + 1), delay: 2.02 + i * 0.035, scale },
    ];
  });

  return { flowers, branches, leaves };
}

export { CENTER_X, CENTER_Y_BOTTOM, STEM_TOP_Y };
