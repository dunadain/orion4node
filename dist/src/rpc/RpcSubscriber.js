"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcSubscriber = void 0;
const SubscriberBase_1 = require("../router/subscribers/SubscriberBase");
const RpcUtils_1 = require("./RpcUtils");
const Logger_1 = require("../logger/Logger");
/**
 * listen for rpc events
 * don't store any state in the server
 */
class RpcSubscriber extends SubscriberBase_1.SubscriberBase {
    protoPath = '';
    protoRoot;
    async init() {
        this.protoRoot = (await Promise.resolve(`${this.protoPath}`).then(s => require(s)));
    }
    process(msg) {
        const subject = msg.subject;
        let index = subject.lastIndexOf('.');
        let index2 = 0;
        const responseKey = subject.substring(index + 1);
        index2 = index;
        index = subject.lastIndexOf('.', index - 1);
        const requestKey = subject.substring(index + 1, index2);
        index2 = index;
        index = subject.lastIndexOf('.', index - 1);
        const methodName = subject.substring(index + 1, index2);
        index2 = index;
        index = subject.lastIndexOf('.', index - 1);
        const serviceKey = subject.substring(index + 1, index2);
        const methodKey = serviceKey + '.' + methodName.charAt(0).toLowerCase() + methodName.slice(1);
        if (!this.protoRoot) {
            Logger_1.logger.error('protoRoot not found');
            return;
        }
        const decoded = this.protoRoot.lookupType(requestKey).decode(msg.data);
        (0, RpcUtils_1.callRpc)(methodKey, decoded)
            .then((result) => {
            if (msg.reply) {
                if (!this.protoRoot)
                    return;
                const structure = this.protoRoot.lookupType(responseKey);
                const err = structure.verify(result);
                if (err)
                    return Promise.reject(new Error(err));
                const protoMessage = structure.create(result);
                msg.respond(structure.encode(protoMessage).finish());
            }
        })
            .catch((err) => {
            Logger_1.logger.error(err);
        });
    }
}
exports.RpcSubscriber = RpcSubscriber;
