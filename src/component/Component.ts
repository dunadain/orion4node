import { Server } from '../server/Server';

export abstract class Component {

    constructor(public readonly server: Server) {
    }
    start?(): Promise<void>;
}