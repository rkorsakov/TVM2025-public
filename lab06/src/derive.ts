import {Expr} from "../../lab04/src";

export function derive(e: Expr, varName: string): Expr {
    switch (e.type) {
        case "number":
            return {type: "number", value: 0}
        case "variable":
            return {type: "number", value: e.name === varName ? 1 : 0};
        case "unaryMinus":
            return {type: "unaryMinus", operand: derive(e.operand, varName)}
        case "binary":
            const left = e.left;
            const right = e.right;
            const dLeft = derive(left, varName);
            const dRight = derive(right, varName);
            switch (e.operator) {
                case "+":
                    return {type: "binary", operator: "+", left: dLeft, right: dRight}
                case "-":
                    return {type: "binary", operator: "-", left: dLeft, right: dRight}
                case "*":
                    return {
                        type: "binary",
                        operator: "+",
                        left: {
                            type: "binary",
                            operator: "*",
                            left: dLeft,
                            right: right
                        },
                        right: {
                            type: "binary",
                            operator: "*",
                            left: left,
                            right: dRight
                        }
                    }
                case "/":
                    return {
                        type: 'binary',
                        operator: '/',
                        left: {
                            type: 'binary',
                            operator: '-',
                            left: {
                                type: 'binary',
                                operator: '*',
                                left: right,
                                right: dLeft
                            },
                            right: {
                                type: 'binary',
                                operator: '*',
                                left: left,
                                right: dRight
                            }
                        },
                        right: {
                            type: 'binary',
                            operator: '*',
                            left: right,
                            right: right
                        }
                    }
            }
    }
}

function isZero(e: Expr): boolean {
    throw "Not implemented"
}

function isOne(e: Expr): boolean {
    throw "Not implemented"
}
