/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function getRoute(routeKey: number) {
    return dic[routeKey];
}

let dic: Record<number, string> = {};

export function route(target: any, propName: string) {
    const obj = new target.constructor();
    dic = obj[propName];
}
