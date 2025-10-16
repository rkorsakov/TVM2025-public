import {c as C, Op, I32} from "../../wasm";
import {Expr} from "../../lab04/src";
import {buildOneFunctionModule, Fn} from "./emitHelper";

const {i32, get_local} = C;

export function getVariables(e: Expr): string[] {
    let res: string[] = [];
    switch (e.type) {
        case "variable":
            res.push(e.name);
            break;
        case "binary":
            res = res.concat(getVariables(e.left));
            res = res.concat(getVariables(e.right));
            break;
        case "unaryMinus":
            res = res.concat(getVariables(e.operand));
            break;
        case "number":
            break;
    }
    return [...new Set(res)];
}

export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>> {
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {
    switch (e.type) {
        case "number":
            return i32.const(e.value)
        case "variable":
            const index = args.indexOf(e.name);
            if (index === -1) {
                throw new Error(`Variable ${e.name} not found in function parameters`);
            }
            return get_local(i32, index)
        case "unaryMinus":
            const val = wasm(e.operand, args)
            return i32.sub(i32.const(0), val)
        case "binary":
            const left = wasm(e.left, args)
            const right = wasm(e.right, args)
            switch (e.operator) {
                case "+":
                    return i32.add(left, right);
                case "-":
                    return i32.sub(left, right);
                case "*":
                    return i32.mul(left, right);
                case "/":
                    return i32.div_s(left, right);
            }
    }
}
