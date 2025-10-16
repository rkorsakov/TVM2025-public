import {MatchResult} from 'ohm-js';
import {arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError} from '../../lab03';
import {Expr} from './ast';

export const getExprAst: ArithmeticActionDict<Expr> = {
    number_number(_) {
        return {
            type: "number",
            value: parseInt(this.sourceString)
        };
    },
    number_variable(_) {
        return {
            type: "variable",
            name: this.sourceString
        };
    },
    Primary_parenthesis(_arg0, expr, _arg2) {
        return expr.parse()
    },
    Primary_unaryMin(_, expr) {
        return {
            type: "unaryMinus",
            operand: expr.parse()
        };
    },
    Sum(terms) {
        const children = terms.asIteration().children
        let result = children[0].parse();
        for (let i = 1; i < children.length; i++) {
            result = {
                type: 'binary',
                operator: '+',
                left: result,
                right: children[i].parse()
            };
        }
        return result
    },
    Sub(terms) {
        const children = terms.asIteration().children;
        let result = children[0].parse();
        for (let i = 1; i < children.length; i++) {
            result = {
                type: 'binary',
                operator: '-',
                left: result,
                right: children[i].parse()
            };
        }
        return result;
    },
    Mul(terms) {
        const children = terms.asIteration().children;
        let result = children[0].parse();
        for (let i = 1; i < children.length; i++) {
            result = {
                type: 'binary',
                operator: '*',
                left: result,
                right: children[i].parse()
            };
        }
        return result;
    },
    Div(terms) {
        const children = terms.asIteration().children;
        let result = children[0].parse();
        for (let i = 1; i < children.length; i++) {
            result = {
                type: 'binary',
                operator: '/',
                left: result,
                right: children[i].parse()
            };
        }
        return result;
    }
}

export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics {
    (match: MatchResult): ArithActionsExt
}

export interface ArithActionsExt {
    parse(): Expr
}

export function parseExpr(source: string): Expr {
    const match = arithGrammar.match(source);
    if (!match.succeeded()){
        throw new SyntaxError(match.message);
    }
    return semantics(match).parse();
}


    
