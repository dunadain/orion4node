import { Server } from '../server/Server';

export abstract class Component {

    constructor(public readonly server: Server) {
    }
    protected start?(): void;
}