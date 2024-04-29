import { ComponentConstructor } from '../interfaces/defines';
import { Server } from '../server/Server';
/**
 * Component lift cycle: init -> start -> dispose
 */
export declare abstract class Component {
    readonly server: Server;
    constructor(server: Server);
    init?(): Promise<void>;
    /**
     * will be called after init
     */
    start?(): Promise<void>;
    dispose?(): Promise<void>;
    getComponent<T extends Component>(classConstructor: ComponentConstructor<T>): T | undefined;
}
