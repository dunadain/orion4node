import { ComponentConstructor } from '../TypeDef';
import { Server } from '../server/Server';

export abstract class Component {
    constructor(public readonly server: Server) {}
    init?(): Promise<void>;
    start?(): Promise<void>;
    dispose?(): void;

    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined {
        return this.server.getComponent(classConstructor);
    }
}
