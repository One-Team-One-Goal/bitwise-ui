import introPhoto from '@/assets/photos/intro.png'
import logicGatesPhoto from '@/assets/photos/logic gates.png'
import truthTablesPhoto from '@/assets/photos/truth tables.png'
import simplificationPhoto from '@/assets/photos/simplification.png'
import type { Lesson } from './types'

// Lessons with topics
export const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Intro to Boolean Algebra',
    description: 'Basics, history, and importance in logic.',
    details:
      "Boolean Algebra deals with true/false values. It's key in computer science and circuit design.",
    topics: [
      {
        id: '1-1',
        title: 'What is Boolean Algebra?',
        description: 'Definition and origins.',
      },
      {
        id: '1-2',
        title: 'Boolean Values',
        description: 'True/False, 1/0, and their meaning.',
      },
      {
        id: '1-3',
        title: 'Applications',
        description: 'Where Boolean Algebra is used.',
      },
    ],
  },
  {
    id: 2,
    title: 'Logic Gates',
    description: 'Learn AND, OR, NOT, and more.',
    details:
      'Logic gates are digital circuit components that execute Boolean functions.',
    topics: [
      {
        id: '2-1',
        title: 'AND, OR, NOT',
        description: 'Basic gates and their symbols.',
      },
      {
        id: '2-2',
        title: 'NAND, NOR',
        description: 'Universal gates and their uses.',
      },
      {
        id: '2-3',
        title: 'XOR, XNOR',
        description: 'Exclusive gates and applications.',
      },
    ],
  },
  {
    id: 3,
    title: 'Truth Tables',
    description: 'Make and read truth tables.',
    details:
      'Truth tables show all possible input/output combinations for logical expressions.',
    topics: [
      {
        id: '3-1',
        title: 'Constructing Truth Tables',
        description: 'Step-by-step process.',
      },
      {
        id: '3-2',
        title: 'Reading Truth Tables',
        description: 'How to interpret results.',
      },
      {
        id: '3-3',
        title: 'Truth Tables for Gates',
        description: 'Examples for each gate.',
      },
    ],
  },
  {
    id: 4,
    title: 'Simplification',
    description: 'Reduce logic expressions efficiently.',
    details:
      'Simplifying logic reduces circuit complexity and improves performance.',
    topics: [
      {
        id: '4-1',
        title: 'Boolean Laws',
        description: 'Commutative, Associative, Distributive.',
      },
      {
        id: '4-2',
        title: 'Karnaugh Maps',
        description: 'Visual simplification method.',
      },
      {
        id: '4-3',
        title: 'Practical Examples',
        description: 'Simplifying real expressions.',
      },
    ],
  },
]

// Map lesson id -> photo
export const lessonImages: Record<number, string> = {
  1: introPhoto,
  2: logicGatesPhoto,
  3: truthTablesPhoto,
  4: simplificationPhoto,
}

// Inspirational quotes from computer science pioneers
export const csQuotes = [
  {
    text: 'The only way to learn a new programming language is by writing programs in it.',
    author: 'Dennis Ritchie',
  },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    text: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
  },
  {
    text: 'Logic is the beginning of wisdom, not the end.',
    author: 'Leonard Nimoy',
  },
]
