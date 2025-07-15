export const lessons: Lesson[] = [
  {
    id: 'boolean-laws',
    name: 'Laws and Theorems of Boolean Algebra',
    pages: [
      {
        title: 'Objectives',
        blocks: [
          {
            type: 'list',
            list: [
              'Describe the laws and theorems of Boolean Algebra',
              'Use the Boolean laws and theorems in simplifying logic functions',
            ],
          },
        ],
      },
      {
        title: 'Introduction',
        blocks: [
          {
            type: 'list',
            list: [
              'In the latter part of the nineteenth century, George Boole suggested that logical thought could be represented through mathematical equations.',
              'Modern computers are implementations of Boole’s Laws of Thought.',
            ],
          },
        ],
      },
      {
        title: 'What is Boolean Algebra?',
        blocks: [
          {
            type: 'list',
            list: [
              'Boolean algebra is a mathematical system for the manipulation of variables that can have one of two values.',
              'Boolean expressions are created by performing operations on Boolean variables using AND, OR, and NOT.',
            ],
          },
        ],
      },
      {
        title: 'Laws of Boolean Algebra',
        blocks: [
          {
            type: 'table',
            text: 'Most Boolean identities have an AND (product) form as well as an OR (sum) form.',
            table: {
              headers: ['Identity Name', 'AND Form', 'OR Form'],
              rows: [
                ['Identity Law', '1x = x', '0 + x = x'],
                ['Null Law', '0x = 0', '1 + x = 1'],
                ['Idempotent Law', 'xx = x', 'x + x = x'],
                ['Inverse Law', 'x\u0305x = 0', 'x + x\u0305 = 1'],
                ['Commutative Law', 'xy = yx', 'x + y = y + x'],
                [
                  'Associative Law',
                  '(xy)z = x(yz)',
                  '(x + y) + z = x + (y + z)',
                ],
                [
                  'Distributive Law',
                  'x + yz = (x + y)(x + z)',
                  'x(y + z) = xy + xz',
                ],
                [
                  "DeMorgan's Law",
                  '(xy)\u0305 = x\u0305 + y\u0305',
                  '(x+y)\u0305 = x\u0305y\u0305',
                ],
                ['Double Complement Law', '(x\u0305)\u0305 = x', ''],
                [
                  'Absorption Law',
                  'x(x+y) = x\nx(x\u0305+y) = xy',
                  'x + xy = x\nx + x\u0305y = x+y',
                ],
              ],
            },
          },
        ],
      },
      {
        title: 'Example Identities',
        blocks: [
          {
            type: 'list',
            list: [
              '(x + y)(x + y) = x',
              'x(x + y) = xy',
              'x + xy = x + y',
              '(x+y)(x\u0305+y) = x',
            ],
          },
        ],
      },
      {
        title: 'Applying Boolean Algebra',
        blocks: [
          {
            type: 'list',
            list: [
              'Sometimes it is more economical to build a circuit using the complement of a function (and complementing its result) than it is to implement the function directly.',
              'DeMorgan’s law provides an easy way of finding the complement of a Boolean function.',
              'Recall DeMorgan’s law states:',
            ],
          },
          {
            type: 'inlineCode',
            code: '(xy)\u0305 = x\u0305 + y\u0305 and (x+y)\u0305 = x\u0305y\u0305',
          },
        ],
      },
      {
        title: 'Example: Boolean Simplification Steps',
        blocks: [
          {
            type: 'inlineCode',
            code: 'F(X,Y,Z) = (X + Y) (X + Y\u0305) (XZ)\u0305',
          },
          {
            type: 'table',
            text: 'Simplification steps:',
            table: {
              headers: ['Expression', 'Law Applied'],
              rows: [
                [
                  '(X + Y) (X + Y\u0305) (XZ)\u0305',
                  'Idempotent Law (Rewriting)',
                ],
                ['(X + Y\u0305) (X + Y) (X\u0305 + Z\u0305)', 'DeMorgan’s Law'],
                [
                  '(XX\u0305 + XY\u0305 + XY + Y Y\u0305) (X\u0305 + Z\u0305)',
                  'Distributive Law',
                ],
                [
                  '( (X + Y) + X (Y + Y\u0305) ) (X\u0305 + Z\u0305)',
                  'Commutative & Distributive Laws',
                ],
                ['( (X + 0)  + X(1) ) (X\u0305 + Z\u0305)', 'Inverse Law'],
                ['X (X\u0305 + Z\u0305)', 'Idempotent Law'],
                ['XX\u0305 + XZ\u0305', 'Distributive Law'],
                ['0 + XZ\u0305', 'Inverse Law'],
                ['XZ\u0305', 'Idempotent Law'],
              ],
            },
          },
        ],
      },
      {
        title: 'DeMorgan’s Law',
        blocks: [
          {
            type: 'list',
            list: [
              'DeMorgan’s law can be extended to any number of variables.',
              'Replace each variable by its complement.',
              'Change all ANDs to ORs and all ORs to ANDs.',
            ],
          },
          {
            type: 'text',
            text: 'Thus, we find the complement of:',
          },
          {
            type: 'inlineCode',
            code: 'F(X,Y,Z) = (XY)\u0305 + (XZ)\u0305 + (YZ)\u0305',
          },
          {
            type: 'text',
            text: 'is:',
          },
          {
            type: 'inlineCode',
            code: 'F\u0305(X,Y,Z) = ( (XY)\u0305 + (XZ)\u0305 + (YZ)\u0305 )\u0305 = (XY)\u0305\u0305 (XZ)\u0305\u0305 (YZ)\u0305\u0305 = (X\u0305+Y\u0305)(X\u0305+Z\u0305)(Y\u0305+Z\u0305)',
          },
        ],
      },
      {
        title: 'SOP Simplification',
        blocks: [
          {
            type: 'text',
            text: 'SOP',
          },
          {
            type: 'inlineCode',
            code: 'F(x,y,z) = x\u0305yz\u0305+x\u0305yz+xyz\u0305+xyz',
          },
          {
            type: 'inlineCode',
            code: '= x\u0305y(z\u0305+z) + xy(z\u0305+z)',
          },
          {
            type: 'inlineCode',
            code: '= x\u0305y + xy',
          },
          {
            type: 'inlineCode',
            code: '= y(x\u0305+x)',
          },
          {
            type: 'inlineCode',
            code: '= y + x\u0305z\u0305',
          },
          {
            type: 'inlineCode',
            code: '= y + x\u0305z\u0305',
          },
          {
            // Moved this table block to the end of the blocks array
            type: 'table',
            table: {
              headers: ['x', 'y', 'z', 'F'],
              rows: [
                ['0', '0', '0', '0'],
                ['0', '0', '1', '0'],
                ['0', '1', '0', '1'],
                ['0', '1', '1', '1'],
                ['1', '0', '0', '0'],
                ['1', '0', '1', '0'],
                ['1', '1', '0', '1'],
                ['1', '1', '1', '1'],
              ],
            },
          },
        ],
      },
      {
        title: 'POS Simplification',
        blocks: [
          {
            type: 'text',
            text: 'POS',
          },
          {
            type: 'inlineCode',
            code: 'F(x,y,z) = (x+y+z)(x+y+z\u0305)(x\u0305+y+z\u0305)',
          },
          {
            type: 'inlineCode',
            code: '= (x+y)(x\u0305+y+z\u0305)',
          },
          {
            type: 'inlineCode',
            code: '= 0+xy+xz\u0305+xy+y+yz\u0305',
          },
          {
            type: 'inlineCode',
            code: '= y(x\u0305+x+1+z\u0305) + xz\u0305',
          },
          {
            type: 'inlineCode',
            code: '= y + xz\u0305',
          },
          {
            // Moved this table block to the end of the blocks array
            type: 'table',
            table: {
              headers: ['x', 'y', 'z', 'F'],
              rows: [
                ['0', '0', '0', '0'],
                ['0', '0', '1', '0'],
                ['0', '1', '0', '1'],
                ['0', '1', '1', '1'],
                ['1', '0', '0', '0'],
                ['1', '0', '1', '0'],
                ['1', '1', '0', '1'],
                ['1', '1', '1', '1'],
              ],
            },
          },
        ],
      },
      {
        title: 'Boolean Operations Table',
        blocks: [
          {
            type: 'table',
            text: 'Truth table for basic Boolean operations (AND, OR, XOR):',
            table: {
              headers: ['A', 'B', 'A AND B', 'A OR B', 'A XOR B'],
              rows: [
                ['0', '0', '0', '0', '0'],
                ['0', '1', '0', '1', '1'],
                ['1', '0', '0', '1', '1'],
                ['1', '1', '1', '1', '0'],
              ],
            },
          },
        ],
      },
    ],
  },
]
