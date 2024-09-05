var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { protocol } from '../../../src/router/RouterUtils.mjs';
import { Server } from '../../../src/server/Server.mjs';
import { Proto } from '../../utils/Proto.mjs';
export class GameHandler {
    async handle(context, data, server) {
        return { name: 'Hello Game' };
    }
    async gameUpdate(context, data, server) {
        console.log('game update');
    }
}
__decorate([
    protocol(Proto.GameLogin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Server]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "handle", null);
__decorate([
    protocol(Proto.GameUpdate),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Server]),
    __metadata("design:returntype", Promise)
], GameHandler.prototype, "gameUpdate", null);
