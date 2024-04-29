"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyArray = void 0;
function copyArray(dest, doffset, src, soffset, length) {
    if ('function' === typeof src.copy) {
        // Buffer
        src.copy(dest, doffset, soffset, soffset + length);
    }
    else {
        // Uint8Array
        for (let index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++];
        }
    }
}
exports.copyArray = copyArray;
