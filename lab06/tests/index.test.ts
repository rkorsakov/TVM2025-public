import { test } from "../../mark";

import { Expr, parseExpr, printExpr } from "../../lab04/src";
import { compileAndExecute, getVariables } from "../../lab05/src";

import { derive } from "../src";

const parseAndDerive = (source: string, varName: string) => derive(parseExpr(source), varName);


describe("Numerical tests", ()=>{
    test("C' = 0", 3, deriveAndCalculate, 0, "35+7", "x");
    test("(f + g)' = f' + g' 1", 3, deriveAndCalculate, 0, "2+x*y", "x", 42, 0);
    test("(f + g)' = f' + g' 2", 3, deriveAndCalculate, 5, "2+x*y", "x", 42, 5);
    test("(f - g)' = f' - g' 1", 3, deriveAndCalculate, 0, "2-x*y", "x", 42, 0);
    test("(f - g)' = f' - g' 2", 3, deriveAndCalculate, -5, "2-x*y", "x", 42, 5);    
    test("(f*g)' == f'*g + f*g' 1", 3, deriveAndCalculate, 0, "x*y", "x", 0, 0);
    test("(f*g)' == f'*g + f*g' 2", 3, deriveAndCalculate, 10, "x*y", "x", 10, 10); 
    test("(f/g)' == (f'*g - f*g')/(g^2) 1", 3, deriveAndCalculate, 1, "x/y", "x", 1, 1);
    test("(f/g)' == (f'*g - f*g')/(g^2) 2", 3, deriveAndCalculate, 1, "x/y", "x", 10, 1);
    test("(f/g)' == (f'*g - f*g')/(g^2) 3", 3, deriveAndCalculate, -1, "x/y", "y", 1, 1);
    test("(f/g)' == (f'*g - f*g')/(g^2) 3", 3, deriveAndCalculate, -4, "x/y", "y", 16, 2);
});

describe("Structural tests", ()=>{
    test("Constant derives to zero 1", 3, parseAndDerive, parseExpr("0"), "42", "x");
    test("Constant derives to zero 2", 4, parseAndDerive, parseExpr("0"), "-42", "x");
    test("Variable derives to one", 3, parseAndDerive, parseExpr("1"), "x", "x");
    test("Variable derives by other variable to zero", 3, parseAndDerive, parseExpr("0"), "x", "y");
    test("(f + g)' = f' + g' 1", 4, parseAndDerive, parseExpr("2+y"), "2*x+x*y", "x");
    test("(f + g)' = f' + g' 2", 4, parseAndDerive, parseExpr("x"), "2*x+x*y", "y");
    test("(f - g)' = f' - g' 1", 4, parseAndDerive, parseExpr("2-y"), "2*x-x*y", "x");
    test("(f - g)' = f' - g' 2", 4, parseAndDerive, parseExpr("-x"), "2*x-x*y", "y");    
    test("(f - g)' = f' - g' 3", 4, parseAndDerive, parseExpr("x"), "x*y-x*2", "y");    
    test("(f*g)' == f'*g + f*g' 1", 4, parseAndDerive, parseExpr("y"), "x*y", "x");
    test("(f*g)' == f'*g + f*g' 2", 4, parseAndDerive, parseExpr("x"), "x*y", "y");
    test("(f*g)' == f'*g + f*g' 3", 4, parseAndDerive, parseExpr("x*y*f*g*h"), "x*y*z*f*g*h", "z");
    test("(f / g)' = (f'*g - g'*f)/g*g ", 4, parseAndDerive, ()=>parseExpr("1/(y*y)"), "5*x-1/y", "y");
});



async function deriveAndCalculate(source: string, varName: string, ...args:number[]): Promise<number>
{
    let expr = parseExpr(source);
    // we will use the original variable list to isolate the user from the 
    // case when some variable(s) disappear after derivation
    // e.g. x + x*y + z |'x yields (1 + y), leaving only one variable.
    let variables = getVariables(expr); 
    let derivative = derive(expr, varName);
    return await compileAndExecute(derivative, variables, ...args);
}