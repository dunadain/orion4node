export interface PkgHandler {
    handle(msg?: Buffer): void;
    dispose(): void;
}