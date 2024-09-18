import { httpProto } from '../../../src/index.mjs';
import { HttpProto } from '../http-proto.mjs';

export class LoginHandler {
    @httpProto(HttpProto.Login)
    async login(data: any, server: any) {
        return { name: 'Hello Login ' + data.name };
    }
}
