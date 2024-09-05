import * as os from 'node:os';
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
export const ipUtil = new IpUtil();
