import { ComponentConstructor } from '../utils/TypeDef';
import { Server } from '../server/Server';

/**
 * Component lift cycle: init -> start -> dispose
 */
export abstract class Component {
    constructor(public readonly server: Server) {}
    init?(): Promise<void>;
    /**
     * will be called after init
     */
    start?(): Promise<void>;
    dispose?(): Promise<void>;

    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined {
        return this.server.getComponent(classConstructor);
    }
}
