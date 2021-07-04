export * as geometry from "./geometry.js";

export class Feature {
  constructor({ properties, geometry }) {
    this.properties = properties;
    this.geometry = geometry;
  }

  toJSON() {
    return {
      type: "Feature",
      properties: this.properties,
      geometry: this.geometry,
    };
  }
}
