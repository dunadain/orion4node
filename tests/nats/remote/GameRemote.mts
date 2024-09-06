import { serveRpc } from '../../../src/index.mjs';
import root from '../../utils/protores/bundle.js';

export class Greeter {
    @serveRpc('Greeter.SayHello', root.HelloRequest, root.HelloReply)
    async sayHello(req: { name: string }) {
        return { message: `Hello, ${req.name}` };
    }
}
