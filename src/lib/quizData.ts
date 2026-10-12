import { Course, QuizQuestion } from '../types';

export const COURSE_QUIZZES: Record<string, QuizQuestion[]> = {
  python: [
    {
      id: 'py-q1',
      question: 'Which of the following is the correct syntax to output "Hello World" in Python?',
      options: [
        'print("Hello World")',
        'echo("Hello World")',
        'Console.WriteLine("Hello World")',
        'System.out.println("Hello World")',
      ],
      correctIndex: 0,
      explanation: 'In Python, the built-in print() function is used to output text and variables to the console.',
    },
    {
      id: 'py-q2',
      question: 'How do you indicate a block of code (such as inside a loop or function) in Python?',
      options: [
        'Using curly brackets { }',
        'Using indentation (spaces/tabs)',
        'Using parentheses ( )',
        'Using semicolons ; at the end of each line',
      ],
      correctIndex: 1,
      explanation: 'Python uses whitespace indentation to define code blocks, making Python code clean and consistent.',
    },
    {
      id: 'py-q3',
      question: 'What is the keyword used to define a function in Python?',
      options: ['function', 'func', 'def', 'define'],
      correctIndex: 2,
      explanation: 'The "def" keyword is short for "define" and is used before the function name to create a function in Python.',
    },
    {
      id: 'py-q4',
      question: 'Which collection type is ordered, changeable (mutable), and written with square brackets [ ]?',
      options: ['Tuple', 'List', 'Set', 'Dictionary'],
      correctIndex: 1,
      explanation: 'A Python List is ordered, mutable, and created using square brackets like: numbers = [1, 2, 3].',
    },
  ],
  java: [
    {
      id: 'java-q1',
      question: 'What is the entry point method where every standalone Java application starts execution?',
      options: [
        'public static void main(String[] args)',
        'public void start()',
        'public static void run()',
        'void init(String[] args)',
      ],
      correctIndex: 0,
      explanation: 'In Java, the JVM searches for "public static void main(String[] args)" as the starting point of the application.',
    },
    {
      id: 'java-q2',
      question: 'Which OOP principle involves wrapping data (variables) and code (methods) together into a single unit and restricting direct access to internal details?',
      options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
      correctIndex: 2,
      explanation: 'Encapsulation is achieved by making fields private and providing public getters and setters to protect data integrity.',
    },
    {
      id: 'java-q3',
      question: 'What keyword is used in Java to create a new instance of a class (an object)?',
      options: ['make', 'instance', 'create', 'new'],
      correctIndex: 3,
      explanation: 'The "new" keyword allocates memory on the heap and calls the class constructor to instantiate an object.',
    },
    {
      id: 'java-q4',
      question: 'What does "JVM" stand for in the Java ecosystem?',
      options: [
        'Java Virtual Machine',
        'Java Verified Memory',
        'Java Variable Manager',
        'Java Visual Module',
      ],
      correctIndex: 0,
      explanation: 'JVM stands for Java Virtual Machine, which enables a computer to execute Java bytecode across multiple operating systems.',
    },
  ],
  aiml: [
    {
      id: 'ai-q1',
      question: 'In Machine Learning, what type of learning uses labeled data (input paired with the correct output) to train models?',
      options: [
        'Supervised Learning',
        'Unsupervised Learning',
        'Reinforcement Learning',
        'Heuristic Learning',
      ],
      correctIndex: 0,
      explanation: 'Supervised Learning trains algorithms using datasets with known labels or correct answers (e.g. labeled spam vs not spam emails).',
    },
    {
      id: 'ai-q2',
      question: 'What does "LLM" stand for in modern AI systems like KiranLMS and Gemini?',
      options: [
        'Large Language Model',
        'Low-Level Memory',
        'Logical Learning Method',
        'Linear Linguistic Module',
      ],
      correctIndex: 0,
      explanation: 'LLM stands for Large Language Model, a neural network trained on vast text data to understand and generate human language.',
    },
    {
      id: 'ai-q3',
      question: 'What is the basic computational unit in an Artificial Neural Network, inspired by the biological brain?',
      options: ['Neuron (Perceptron)', 'Byte', 'Kernel', 'Relay'],
      correctIndex: 0,
      explanation: 'An artificial neuron (or node) receives inputs, calculates a weighted sum, applies an activation function, and outputs a signal.',
    },
    {
      id: 'ai-q4',
      question: 'Why is training data quality crucial when training Machine Learning models?',
      options: [
        'Models mirror patterns and biases in the data they are trained on ("garbage in, garbage out")',
        'Computers will crash if data has any numbers',
        'It makes the code run in Python instead of Java',
        'Data quality only matters for database storage, not AI',
      ],
      correctIndex: 0,
      explanation: 'High-quality, unbiased, and representative training data is the foundation of accurate, safe, and helpful AI models.',
    },
  ],
};

/**
 * Returns quiz questions for any course.
 * Matches by title keyword or generates tailored questions for custom courses.
 */
export function getQuizForCourse(course: Course): QuizQuestion[] {
  const title = course.title.toLowerCase();

  if (title.includes('python')) {
    return COURSE_QUIZZES.python;
  }
  if (title.includes('java')) {
    return COURSE_QUIZZES.java;
  }
  if (title.includes('ai') || title.includes('machine learning')) {
    return COURSE_QUIZZES.aiml;
  }

  // Dynamic quiz for admin-created custom courses
  return [
    {
      id: `${course.id}-q1`,
      question: `What is the primary objective of studying "${course.title}"?`,
      options: [
        'To understand foundational concepts and practical implementation',
        'To avoid writing code altogether',
        'To memorize code without understanding how it works',
        'To replace computer operating systems',
      ],
      correctIndex: 0,
      explanation: `Studying ${course.title} develops hands-on skills, practical problem solving, and computational thinking.`,
    },
    {
      id: `${course.id}-q2`,
      question: 'What is a best practice when writing clean, maintainable software?',
      options: [
        'Using descriptive variable names and modular functions with clear comments',
        'Putting all code into a single 5,000-line function',
        'Never testing your code with sample inputs',
        'Removing all indentation to save file space',
      ],
      correctIndex: 0,
      explanation: 'Readable code with descriptive names, modular functions, and comments makes software easy to debug and collaborate on.',
    },
    {
      id: `${course.id}-q3`,
      question: 'When encountering a programming error or bug while studying, what is the best first step?',
      options: [
        'Read the error message, identify the line number, and break down what caused it',
        'Immediately delete all code and abandon the project',
        'Assume the computer made a random mistake',
        'Turn off the monitor and restart the machine',
      ],
      correctIndex: 0,
      explanation: 'Error messages in programming describe what went wrong and provide the exact line number, guiding you directly to the solution.',
    },
    {
      id: `${course.id}-q4`,
      question: 'How can you reinforce what you learned in this course?',
      options: [
        'Build small practical mini-projects and ask KiranLMS AI Tutor questions when stuck',
        'Only read code without ever typing or running it',
        'Wait 6 months before writing your first program',
        'Memorize programming syntax like vocabulary without practicing',
      ],
      correctIndex: 0,
      explanation: 'Active practice through hands-on coding and asking questions is the proven way to build long-term retention and mastery.',
    },
  ];
}
