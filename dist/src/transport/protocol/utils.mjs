export function copyArray(dest, doffset, src, soffset, length) {
    for (let index = 0; index < length; index++) {
        dest[doffset + index] = src[soffset + index];
    }
}
