"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Ok"] = 0] = "Ok";
    ErrorCode[ErrorCode["InvalidPkgType"] = 1] = "InvalidPkgType";
    ErrorCode[ErrorCode["InvaildHandShakeInfo"] = 500] = "InvaildHandShakeInfo";
    ErrorCode[ErrorCode["OutdatedClient"] = 501] = "OutdatedClient";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
