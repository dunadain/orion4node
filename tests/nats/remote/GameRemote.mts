import { serveRpc } from '../../../src/index.mjs';
import { HelloReply, HelloRequest } from '../../utils/protores/bundle.cjs';

export class Greeter {
    @serveRpc('Greeter.SayHello', HelloRequest, HelloReply)
    async sayHello(req: { name: string }) {
        return { message: `Hello, ${req.name}` };
    }

    async bar() {
        return {};
    }
}
