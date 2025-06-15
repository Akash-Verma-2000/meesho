export function createDocKey(str) {
    const charPart = str.substring(0, 3);
    let numPart = str.substring(3, str.length);
    numPart = Number(numPart) + 1;
    return charPart + numPart;
}