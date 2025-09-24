import {ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export const rpnCalc = {
    number(a) {
        return parseInt(a.sourceString)
    },
    Exp_sum(a, b, _) {
        return a.calculate() + b.calculate()
    },
    Exp_mul(a, b, _) {
        return a.calculate() * b.calculate()
    }
} satisfies ReversePolishNotationActionDict<number>;
