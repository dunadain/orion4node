export function copyArray(dest: Buffer, doffset: number, src: Buffer, soffset: number, length: number) {
    for (let index = 0; index < length; index++) {
        dest[doffset + index] = src[soffset + index];
    }
}
