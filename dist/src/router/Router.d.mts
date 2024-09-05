import { Component } from '../component/Component.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';
/**
 * only exists in connector or gate server
 */
export declare class Router extends Component {
    private _nats;
    start(): Promise<void>;
    get nats(): NatsComponent;
}
