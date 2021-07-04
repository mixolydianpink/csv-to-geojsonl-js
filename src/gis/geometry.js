export class Point {
  constructor(coordinates) {
    this.coordinates = coordinates;
  }

  toJSON() {
    return {
      type: "Point",
      coordinates: this.coordinates,
    };
  }
}
