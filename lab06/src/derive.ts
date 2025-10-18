import {Expr} from "../../lab04/src";

export function derive(e: Expr, varName: string): Expr {
    const result = deriveInternal(e, varName);
    return simplify(result);
}

function deriveInternal(e: Expr, varName: string): Expr {
    switch (e.type) {
        case "number":
            return {type: "number", value: 0}
        case "variable":
            return {type: "number", value: e.name === varName ? 1 : 0};
        case "unaryMinus":
            return {type: "unaryMinus", operand: deriveInternal(e.operand, varName)}
        case "binary":
            const left = e.left;
            const right = e.right;
            const dLeft = deriveInternal(left, varName);
            const dRight = deriveInternal(right, varName);
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
                                left: dLeft,
                                right: right
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
    return e.type === "number" && e.value === 0;
}

function isOne(e: Expr): boolean {
    return e.type === "number" && e.value === 1;
}

function simplify(e: Expr): Expr {
    switch (e.type) {
        case "number":
        case "variable":
            return e;

        case "unaryMinus":
            const simplifiedOperand = simplify(e.operand);
            if (simplifiedOperand.type === "unaryMinus") {
                return simplify(simplifiedOperand.operand);
            }
            if (isZero(simplifiedOperand)) {
                return {type: "number", value: 0};
            }
            return {type: "unaryMinus", operand: simplifiedOperand};


        case "binary":
            const left = simplify(e.left);
            const right = simplify(e.right);

            switch (e.operator) {
                case "+":
                    if (isZero(left)) return right;
                    if (isZero(right)) return left;
                    return {type: "binary", operator: "+", left, right};

                case "-":
                    if (isZero(right)) return left;
                    if (isZero(left)) {
                        return simplify({type: "unaryMinus", operand: right});
                    }
                    if (deepEquals(left, right)) {
                        return {type: "number", value: 0};
                    }
                    return {type: "binary", operator: "-", left, right};

                case "*":
                    if (isZero(left) || isZero(right)) {
                        return {type: "number", value: 0};
                    }
                    if (isOne(left)) return right;
                    if (isOne(right)) return left;
                    return {type: "binary", operator: "*", left, right};

                case "/":
                    if (isOne(right)) return left;
                    if (isZero(left)) return {type: "number", value: 0};
                    if (deepEquals(left, right)) {
                        return {type: "number", value: 1};
                    }
                    if (left.type === "unaryMinus" && right.type === "unaryMinus") {
                        return simplify({type: "binary", operator: "/", left: left.operand, right: right.operand});
                    }
                    if (left.type === "unaryMinus") {
                        return simplify({
                            type: "unaryMinus", operand: {
                                type: "binary", operator: "/", left: left.operand, right: right
                            }
                        });
                    }
                    if (right.type === "unaryMinus") {
                        return simplify({
                            type: "unaryMinus", operand: {
                                type: "binary", operator: "/", left: left, right: right.operand
                            }
                        });
                    }
                    return {type: "binary", operator: "/", left, right};
            }
    }
}

function deepEquals(a: Expr, b: Expr): boolean {
    if (a.type !== b.type) return false;

    switch (a.type) {
        case "number":
            return b.type === "number" && a.value === b.value;
        case "variable":
            return b.type === "variable" && a.name === b.name;
        case "unaryMinus":
            return b.type === "unaryMinus" && deepEquals(a.operand, b.operand);
        case "binary":
            return b.type === "binary" &&
                a.operator === b.operator &&
                deepEquals(a.left, b.left) &&
                deepEquals(a.right, b.right);
    }
}