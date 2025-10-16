import {Expr} from "./ast";

function getPriority(operator: string): number {
    switch (operator) {
        case '*':
        case '/':
            return 2;
        case '+':
        case '-':
            return 1;
        default:
            return 0;
    }
}

export function printExpr(e: Expr, parentPriority: number = 0): string {
    switch (e.type) {
        case 'number':
            return e.value.toString();
        case 'variable':
            return e.name;
        case 'unaryMinus':
            const operandStr = printExpr(e.operand, 2);
            if (e.operand.type === 'binary' || e.operand.type === 'unaryMinus') {
                return "-(" + operandStr + ")";
            } else {
                return "-" + operandStr;
            }
        case 'binary':
            const currentPriority = getPriority(e.operator);
            const needParens = currentPriority < parentPriority;
            const leftStr = printExpr(e.left, currentPriority);
            let rightStr = printExpr(e.right, currentPriority);
            if ((e.operator === '-' || e.operator === '/') && e.right.type === 'binary') {
                rightStr = "(" + rightStr + ")";
            }
            const result = leftStr + " " + e.operator + " " + rightStr;
            return needParens ? "(" + result + ")" : result;
    }
}