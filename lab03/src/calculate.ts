import {MatchResult} from "ohm-js";
import grammar, {ArithmeticActionDict, ArithmeticSemantics} from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;

const arithCalc = {
    number_number(arg0: any) {
        return parseInt(arg0.sourceString);
    },
    number_variable(arg0) {
        const varName = arg0.sourceString;
        if (this.args.params[varName] !== undefined) {
            return this.args.params[varName];
        }
        return NaN;
    },
    Sum(arg0) {
        const values = arg0.asIteration().children.map(child =>
            child.calculate(this.args.params)
        );
        if (values.length === 0) return 0;
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
            result += values[i];
        }
        return result;
    },
    Mul(arg0) {
        const values = arg0.asIteration().children.map(child =>
            child.calculate(this.args.params)
        );
        if (values.length === 0) return 0;
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
            result *= values[i];
        }
        return result;
    },
    Div(arg0) {
        const values = arg0.asIteration().children.map(child =>
            child.calculate(this.args.params)
        );
        if (values.length === 0) return 0;
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] == 0)
                throw new Error(`Division by zero`);
            result /= values[i];
        }
        return result;
    },
    Sub(arg0) {
        const values = arg0.asIteration().children.map(child =>
            child.calculate(this.args.params)
        );
        if (values.length === 0) return 0;
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
            result -= values[i];
        }
        return result;
    },
    Primary_parenthesis(arg0, arg1, arg2) {
        return arg1.calculate(this.args.params);
    },
    Primary_unaryMin(arg0, arg1) {
        return -arg1.calculate(this.args.params);
    },
} satisfies ArithmeticActionDict<number | undefined>;

arithSemantics.addOperation<number>("calculate(params)", arithCalc);

export interface ArithActions {
    calculate(params: { [name: string]: number }): number;
}

export interface ArithSemantics extends ArithmeticSemantics {
    (match: MatchResult): ArithActions;
}