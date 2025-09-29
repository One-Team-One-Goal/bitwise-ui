// import axios, { type AxiosResponse } from 'axios';

// // API service for Boolean expression operations
// export interface BooleanExpressionValidationResponse {
//   isValid: boolean;
//   isSimplified: boolean;
//   message: string;
//   simplifiedExpression?: string;
//   errorDetails?: string[];
// }

// export interface RandomExpressionResponse {
//   expression: string;
//   difficulty: 'easy' | 'medium' | 'hard';
//   variables: string[];
// }

// export interface CircuitGenerationResponse {
//   components: any[];
//   connections: any[];
//   layout: {
//     width: number;
//     height: number;
//   };
// }

// class BooleanExpressionService {
//   private baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   async validateExpression(expression: string): Promise<BooleanExpressionValidationResponse> {
//     try {
//       const response: AxiosResponse<BooleanExpressionValidationResponse> = await axios.post(
//         `${this.baseUrl}/boolean/validate`,
//         { expression },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('API validation failed, using fallback:', error);
//       // Fallback validation logic
//       return this.fallbackValidation(expression);
//     }
//   }

//   async simplifyExpression(expression: string): Promise<BooleanExpressionValidationResponse> {
//     try {
//       const response: AxiosResponse<BooleanExpressionValidationResponse> = await axios.post(
//         `${this.baseUrl}/boolean/simplify`,
//         { expression },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('API simplification failed, using fallback:', error);
//       return this.fallbackSimplification(expression);
//     }
//   }

//   async generateRandomExpression(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<RandomExpressionResponse> {
//     try {
//       const response: AxiosResponse<RandomExpressionResponse> = await axios.post(
//         `${this.baseUrl}/boolean/random`,
//         { difficulty },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('API random generation failed, using fallback:', error);
//       return this.fallbackRandomGeneration(difficulty);
//     }
//   }

//   async generateCircuit(expression: string): Promise<CircuitGenerationResponse> {
//     try {
//       const response: AxiosResponse<CircuitGenerationResponse> = await axios.post(
//         `${this.baseUrl}/boolean/generate-circuit`,
//         { expression },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('API circuit generation failed:', error);
//       throw new Error('Circuit generation is not available offline');
//     }
//   }

//   // Fallback validation for offline use
//   private fallbackValidation(expression: string): BooleanExpressionValidationResponse {
//     // Basic validation - check for valid boolean expression format
//     const cleanExpr = expression.replace(/\s/g, '');
    
//     if (!cleanExpr) {
//       return {
//         isValid: false,
//         isSimplified: false,
//         message: 'Please enter a boolean expression',
//         errorDetails: ['Expression is empty']
//       };
//     }

//     // Check for valid characters (letters, operators, parentheses)
//     const validPattern = /^[A-Z¬∨∧⊕()v^+*'!\s]+$/i;
//     const hasVariables = /[A-Z]/i.test(cleanExpr);
    
//     // Check balanced parentheses
//     let parenCount = 0;
//     for (const char of cleanExpr) {
//       if (char === '(') parenCount++;
//       if (char === ')') parenCount--;
//       if (parenCount < 0) break;
//     }
//     const balancedParens = parenCount === 0;
    
//     if (!validPattern.test(expression) || !hasVariables || !balancedParens) {
//       return {
//         isValid: false,
//         isSimplified: false,
//         message: 'Invalid expression format. Use variables (A, B, C...), operators (∨, ∧, ¬), and parentheses.',
//         errorDetails: [
//           !hasVariables ? 'Missing variables' : '',
//           !balancedParens ? 'Unbalanced parentheses' : '',
//           !validPattern.test(expression) ? 'Invalid characters' : ''
//         ].filter(Boolean)
//       };
//     }
    
//     // Simple heuristic for simplification check
//     const complexity = cleanExpr.length;
//     const isSimplified = complexity < 20; // Arbitrary threshold
    
//     return {
//       isValid: true,
//       isSimplified,
//       message: isSimplified 
//         ? 'Expression is already in simplified form! Ready to generate circuit.' 
//         : 'Expression needs simplification. Please use the K-Map or calculator tools first.',
//     };
//   }

//   private fallbackSimplification(expression: string): BooleanExpressionValidationResponse {
//     // For demo purposes, return a mock simplified version
//     return {
//       isValid: true,
//       isSimplified: true,
//       message: 'Expression simplified successfully (demo mode)',
//       simplifiedExpression: expression // In real implementation, this would be the actual simplified form
//     };
//   }

//   private fallbackRandomGeneration(difficulty: 'easy' | 'medium' | 'hard'): RandomExpressionResponse {
//     const expressions = {
//       easy: [
//         'A ∧ B',
//         'A ∨ B',
//         '¬A ∧ B',
//         'A ∨ ¬B',
//         '(A ∧ B) ∨ C'
//       ],
//       medium: [
//         '(A ∧ B) ∨ (¬A ∧ C)',
//         '(A ∨ B) ∧ (¬C ∨ D)',
//         '¬(A ∧ B) ∨ (C ∧ D)',
//         '(A ⊕ B) ∧ (C ∨ D)',
//         '¬((A ∨ B) ∧ (¬C ∨ D)) ∨ (E ∧ (A ∨ ¬D))'
//       ],
//       hard: [
//         '¬((A ∨ B) ∧ (¬C ∨ D)) ∨ (E ∧ (A ∨ ¬D))',
//         '((A ∧ B) ∨ (C ∧ D)) ⊕ ((E ∨ F) ∧ (¬G ∨ H))',
//         '(A ∧ (B ∨ C)) ∨ (¬(D ∧ E) ∧ (F ⊕ G))',
//         '¬(A ∧ B ∧ C) ∨ (D ∧ (E ∨ F)) ∨ (G ⊕ (H ∧ I))'
//       ]
//     };

//     const selectedExpressions = expressions[difficulty];
//     const randomExpression = selectedExpressions[Math.floor(Math.random() * selectedExpressions.length)];
    
//     // Extract variables from the expression
//     const variables = [...new Set(randomExpression.match(/[A-Z]/g) || [])];
    
//     return {
//       expression: randomExpression,
//       difficulty,
//       variables
//     };
//   }
// }

// export const booleanExpressionService = new BooleanExpressionService();