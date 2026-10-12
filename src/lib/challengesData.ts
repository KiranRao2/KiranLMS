import { Course, ProjectChallenge } from '../types';

export const DEFAULT_CHALLENGES: ProjectChallenge[] = [
  {
    id: 'challenge-py-calc',
    title: 'Robust Command-Line Calculator',
    language: 'python',
    difficulty: 'Beginner',
    description:
      'Build a command-line calculator in Python that accepts two numbers and an operator (+, -, *, /). It must cleanly calculate the result and gracefully catch/handle division by zero without crashing.',
    requirements: [
      'Define a function `calculate(num1, num2, operator)` that returns the result or an error message.',
      'Support addition (+), subtraction (-), multiplication (*), and division (/).',
      'Prevent division by zero and return a friendly error message like "Cannot divide by zero".',
      'Include sample test calls demonstrating each operator.',
    ],
    starterCode: `def calculate(num1, num2, operator):
    # TODO: Implement your calculator logic here
    # Remember to handle division by zero safely!
    pass

# Test your function:
print("Addition:", calculate(10, 5, '+'))
print("Division:", calculate(10, 2, '/'))
print("Zero Division Test:", calculate(10, 0, '/'))
`,
  },
  {
    id: 'challenge-py-text',
    title: 'Text Analyzer & Word Counter',
    language: 'python',
    difficulty: 'Intermediate',
    description:
      'Write a Python program that analyzes a paragraph of text and returns the total word count, the unique words, and the most frequently occurring word.',
    requirements: [
      'Define a function `analyze_text(paragraph)` that processes input text.',
      'Convert text to lowercase and remove standard punctuation (. , ! ?).',
      'Return a dictionary containing `total_words`, `unique_words_count`, and `most_frequent_word`.',
      'Handle empty string inputs gracefully.',
    ],
    starterCode: `def analyze_text(paragraph):
    # TODO: Implement text analysis logic
    pass

sample = "Python is amazing! Python is simple, and learning Python is fun."
print(analyze_text(sample))
`,
  },
  {
    id: 'challenge-java-bank',
    title: 'Secure Bank Account Class',
    language: 'java',
    difficulty: 'Beginner',
    description:
      'Design a BankAccount class in Java that demonstrates OOP Encapsulation. Protect balance as private and provide validated deposit and withdrawal methods that disallow negative transactions or overdrafts.',
    requirements: [
      'Create a `BankAccount` class with private fields: `accountHolder` (String) and `balance` (double).',
      'Provide a constructor `BankAccount(String accountHolder, double initialBalance)`.',
      'Implement `deposit(double amount)` ensuring amount is strictly greater than 0.',
      'Implement `withdraw(double amount)` with overdraft protection (cannot withdraw more than current balance).',
      'Provide a `getBalance()` getter and a `printSummary()` method.',
    ],
    starterCode: `public class BankAccount {
    // TODO: Define private encapsulated fields

    // TODO: Constructor

    // TODO: deposit, withdraw, and getBalance methods

    public static void main(String[] args) {
        // Test your class here
        System.out.println("Testing BankAccount...");
    }
}
`,
  },
  {
    id: 'challenge-aiml-sentiment',
    title: 'Rule-Based Text Sentiment Classifier',
    language: 'python',
    difficulty: 'Beginner',
    description:
      'Create a foundational text sentiment analyzer that classifies user reviews into "Positive", "Negative", or "Neutral" based on sentiment lexicon weighting.',
    requirements: [
      'Define lists of positive keywords (e.g. good, great, love, excellent, fast) and negative keywords (e.g. bad, terrible, slow, hate, broken).',
      'Define a function `classify_sentiment(review_text)` that calculates a sentiment score.',
      'Return "Positive" if score > 0, "Negative" if score < 0, and "Neutral" if score == 0.',
      'Print classifications for at least 3 distinct sample reviews.',
    ],
    starterCode: `def classify_sentiment(review_text):
    # TODO: Create keyword lists and score counting algorithm
    pass

# Test sample inputs:
print(classify_sentiment("The course was great and the instructor was excellent!"))
print(classify_sentiment("The video was broken and the explanation was terrible."))
print(classify_sentiment("I watched the video today."))
`,
  },
];

/**
 * Returns project challenges matched to a course or general list.
 */
export function getChallengesForCourse(course?: Course): ProjectChallenge[] {
  if (!course) return DEFAULT_CHALLENGES;

  const titleLower = course.title.toLowerCase();

  if (titleLower.includes('python')) {
    return DEFAULT_CHALLENGES.filter((c) => c.language === 'python');
  }
  if (titleLower.includes('java')) {
    return DEFAULT_CHALLENGES.filter((c) => c.language === 'java');
  }
  if (titleLower.includes('ai') || titleLower.includes('machine learning')) {
    return DEFAULT_CHALLENGES.filter((c) => c.id.includes('sentiment') || c.language === 'python');
  }

  return DEFAULT_CHALLENGES;
}
