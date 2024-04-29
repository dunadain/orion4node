"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHandler = void 0;
const RouterUtils_1 = require("../../../src/router/RouterUtils");
const Server_1 = require("../../../src/server/Server");
const Proto_1 = require("../../utils/Proto");
class TestHandler {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(context, data, server) {
        return 1000;
    }
}
exports.TestHandler = TestHandler;
__decorate([
    (0, RouterUtils_1.protocol)(Proto_1.Proto.GameLogin)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Server_1.Server]),
    __metadata("design:returntype", Promise)
], TestHandler.prototype, "handle", null);
