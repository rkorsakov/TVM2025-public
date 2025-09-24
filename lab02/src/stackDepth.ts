import {ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export type StackDepth = { max: number, out: number };

export const rpnStackDepth = {
    number(a): StackDepth {
        return {max: 1, out: 1};
    },
    Exp_sum(a, b, _): StackDepth {
        const left = a.stackDepth;
        const right = b.stackDepth;
        const maxDepth = Math.max(
            left.max,
            left.out + right.max,
            left.out + right.out
        );
        const outDepth = left.out + right.out - 1;
        return {max: maxDepth, out: outDepth};
    },
    Exp_mul(a, b, _): StackDepth {
        const left = a.stackDepth;
        const right = b.stackDepth;
        const maxDepth = Math.max(
            left.max,
            left.out + right.max,
            left.out + right.out
        );
        const outDepth = left.out + right.out - 1;
        return {max: maxDepth, out: outDepth};
    }
} satisfies ReversePolishNotationActionDict<StackDepth>;