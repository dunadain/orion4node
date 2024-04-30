/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";
var $protobuf = require("protobufjs/light");
var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
    .addJSON({
    Greeter: {
        methods: {
            SayHello: {
                requestType: "HelloRequest",
                responseType: "HelloReply"
            }
        }
    },
    HelloRequest: {
        fields: {
            name: {
                type: "string",
                id: 1
            }
        }
    },
    HelloReply: {
        fields: {
            message: {
                type: "string",
                id: 1
            }
        }
    },
    Attacker: {
        methods: {
            Attack: {
                requestType: "AttackRequest",
                responseType: "AttackReply"
            }
        }
    },
    AttackRequest: {
        fields: {
            name: {
                type: "string",
                id: 1
            }
        }
    },
    AttackReply: {
        fields: {
            message: {
                type: "string",
                id: 1
            }
        }
    }
});
module.exports = $root;
