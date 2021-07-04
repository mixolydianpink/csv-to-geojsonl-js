export * as csv from "./src/csv/mod.js";
export * as gis from "./src/gis/mod.js";

import * as gis from "./src/gis/mod.js";

export const locationToFeature = function ({ properties, longitude, latitude }) {
  return new gis.Feature({
    properties,
    // GeoJSON position coordinates are [longitude, latitude {, elevation}]
    geometry: new gis.geometry.Point([longitude, latitude]),
  });
};
