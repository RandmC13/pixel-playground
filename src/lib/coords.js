export const coordPairToIndex = (x, y, width) => (y * width) + x;
export const indexToCoordPair = (index, width) => ~~(index / width) + (index % width);