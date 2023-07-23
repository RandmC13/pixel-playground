export function coordPairToIndex(x, y, width) {
    return (y * width) + x;
}

export function indexToCoordPair(index, width) {
    return [(index % width), ~~(index / width)];
}