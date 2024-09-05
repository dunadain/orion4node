export class Greeter {
    async sayHello(req: { name: string }) {
        return { message: `Hello, ${req.name}` };
    }

    async bar() {
        return {};
    }
}
