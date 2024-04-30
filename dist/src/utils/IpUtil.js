"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipUtil = void 0;
const os = require("node:os");
class IpUtil {
    address() {
        const networkInterfaces = os.networkInterfaces();
        const addresses = [];
        Object.values(networkInterfaces).forEach((netInterface) => {
            netInterface?.filter((prop) => prop.family === 'IPv4' && !prop.internal)
                .forEach((address) => {
                addresses.push(address.address);
            });
        });
        return addresses[0];
    }
}
exports.ipUtil = new IpUtil();
