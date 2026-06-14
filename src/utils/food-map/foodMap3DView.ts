const DEG = Math.PI / 180;

// Distance a perspective camera needs to frame a bounding sphere of `radius`.
export function fitDistanceForRadius(radius: number, fovDeg: number): number {
  return radius / Math.sin((fovDeg * DEG) / 2);
}

// 1 at/under `near`, 0 at/over `far`, linear in between.
export function labelOpacity(distance: number, near: number, far: number): number {
  if (distance <= near) return 1;
  if (distance >= far) return 0;
  return 1 - (distance - near) / (far - near);
}
