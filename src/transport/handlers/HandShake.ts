import { SocketClient } from '../SocketClient';
import { PkgHandler } from './PkgHandler';

export class HandShake implements PkgHandler {
    constructor(private client: SocketClient<unknown>) { }
    handle(msg?: Buffer): void {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }

}