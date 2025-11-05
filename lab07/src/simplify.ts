import { Expr } from "../../lab04/src";
import { cost } from "./cost";

type MatchResult = { success: true; mappings: Map<string, Expr> } | { success: false };

function match(expr: Expr, pattern: Expr): MatchResult {
    const mappings = new Map<string, Expr>();

    function matchRecursive(e: Expr, p: Expr): boolean {
        if (p.type === "variable") {
            const existing = mappings.get(p.name);
            if (existing) {
                return deepEquals(e, existing);
            }
            mappings.set(p.name, e);
            return true;
        }

        if (e.type !== p.type) return false;

        switch (p.type) {
            case "number":
                return e.type === "number" && e.value === p.value;
            case "unaryMinus":
                return e.type === "unaryMinus" && matchRecursive(e.operand, p.operand);
            case "binary":
                return e.type === "binary" &&
                    e.operator === p.operator &&
                    matchRecursive(e.left, p.left) &&
                    matchRecursive(e.right, p.right);
        }
    }

    return matchRecursive(expr, pattern) ? { success: true, mappings } : { success: false };
}

function substitute(expr: Expr, mappings: Map<string, Expr>): Expr {
    if (expr.type === "variable") {
        return mappings.get(expr.name) || expr;
    }

    switch (expr.type) {
        case "number":
            return expr;
        case "unaryMinus":
            return {
                type: "unaryMinus",
                operand: substitute(expr.operand, mappings)
            };
        case "binary":
            return {
                type: "binary",
                operator: expr.operator,
                left: substitute(expr.left, mappings),
                right: substitute(expr.right, mappings)
            };
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

function constantFold(e: Expr): Expr {
    switch (e.type) {
        case "number":
        case "variable":
            return e;
        case "unaryMinus":
            const foldedOperand = constantFold(e.operand);
            if (foldedOperand.type === "number") {
                return { type: "number", value: -foldedOperand.value };
            }
            return { type: "unaryMinus", operand: foldedOperand };
        case "binary":
            const left = constantFold(e.left);
            const right = constantFold(e.right);

            if (left.type === "number" && right.type === "number") {
                switch (e.operator) {
                    case "+": return { type: "number", value: left.value + right.value };
                    case "-": return { type: "number", value: left.value - right.value };
                    case "*": return { type: "number", value: left.value * right.value };
                    case "/":
                        if (right.value !== 0) {
                            return { type: "number", value: left.value / right.value };
                        }
                        break;
                }
            }
            return { type: "binary", operator: e.operator, left, right };
    }
}

function applyIdentities(expr: Expr, identities: [Expr, Expr][]): Expr {
    let current = expr;
    let changed = true;
    const seen = new Set<string>();

    while (changed) {
        changed = false;
        const exprString = JSON.stringify(current);

        if (seen.has(exprString)) {
            break;
        }
        seen.add(exprString);

        for (const [left, right] of identities) {
            const matchResult = match(current, left);
            if (matchResult.success) {
                const newExpr = substitute(right, matchResult.mappings);
                if (cost(newExpr) <= cost(current)) {
                    current = newExpr;
                    changed = true;
                    break;
                }
            }

            const matchResultReverse = match(current, right);
            if (matchResultReverse.success) {
                const newExpr = substitute(left, matchResultReverse.mappings);
                if (cost(newExpr) <= cost(current)) {
                    current = newExpr;
                    changed = true;
                    break;
                }
            }
        }
    }

    return current;
}

function simplifyRecursive(e: Expr, identities: [Expr, Expr][]): Expr {

    let simplified: Expr;

    switch (e.type) {
        case "number":
        case "variable":
            simplified = e;
            break;
        case "unaryMinus":
            simplified = {
                type: "unaryMinus",
                operand: simplifyRecursive(e.operand, identities)
            };
            break;
        case "binary":
            simplified = {
                type: "binary",
                operator: e.operator,
                left: simplifyRecursive(e.left, identities),
                right: simplifyRecursive(e.right, identities)
            };
            break;
    }

    return applyIdentities(simplified, identities);
}

export function simplify(e: Expr, identities: [Expr, Expr][]): Expr {
    let current = e;
    let previousCost = cost(e);
    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
        iterations++;

        current = simplifyRecursive(current, identities);
        current = constantFold(current);
        current = applyIdentities(current, identities);

        const newCost = cost(current);
        if (newCost >= previousCost) {
            break;
        }
        previousCost = newCost;
    }

    return current;
}