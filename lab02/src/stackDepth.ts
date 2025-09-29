import {ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export type StackDepth = { max: number, out: number };

const binaryOperator = (left: StackDepth, right: StackDepth): StackDepth => ({
    max: Math.max(left.max, left.out + right.max),
    out: left.out + right.out - 1
});

export const rpnStackDepth = {
    number(a): StackDepth {
        return {max: 1, out: 1};
    },
    Exp_sum(a, b, _): StackDepth {
        return binaryOperator(a.stackDepth, b.stackDepth);
    },
    Exp_mul(a, b, _): StackDepth {
        return binaryOperator(a.stackDepth, b.stackDepth);
    }
} satisfies ReversePolishNotationActionDict<StackDepth>;