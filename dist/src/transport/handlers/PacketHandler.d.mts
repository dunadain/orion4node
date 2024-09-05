/// <reference types="node" resolution-mode="require"/>
export interface PkgHandler {
    handle(msg?: Buffer): void;
    dispose?(): void;
}
