export interface MapBoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

const DEFAULT_DELTA = 0.01;

const fixed = (value: number) => value.toFixed(6);

export function buildFallbackBoundingBox(latitude: number, longitude: number, delta = DEFAULT_DELTA): MapBoundingBox {
  return {
    south: latitude - delta,
    north: latitude + delta,
    west: longitude - delta,
    east: longitude + delta,
  };
}

export function buildOsmEmbedUrl(latitude: number, longitude: number, boundingBox?: MapBoundingBox): string {
  const bounds = boundingBox ?? buildFallbackBoundingBox(latitude, longitude);
  const bbox = `${fixed(bounds.west)},${fixed(bounds.south)},${fixed(bounds.east)},${fixed(bounds.north)}`;
  const marker = `${fixed(latitude)},${fixed(longitude)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export function buildOsmMarkerUrl(latitude: number, longitude: number, zoom = 15): string {
  return `https://www.openstreetmap.org/?mlat=${fixed(latitude)}&mlon=${fixed(longitude)}#map=${zoom}/${fixed(latitude)}/${fixed(longitude)}`;
}
