export type Expr =
    | NumberLiteral
    | Variable
    | BinaryOperation
    | UnaryMinus

export interface NumberLiteral {
    type: 'number'
    value: number
}

export interface Variable {
    type: 'variable'
    name: string
}

export interface BinaryOperation {
    type: 'binary'
    operator: '+' | '-' | '*' | '/'
    left: Expr
    right: Expr
}

export interface UnaryMinus {
    type: 'unaryMinus'
    operand: Expr
}