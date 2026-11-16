export const questions = [
  {
    id: "q1",
    question: "When learning something new, do you prefer?",
    options: [
      {
        label: "optionA",
        value: "Practical, hands-on experience"
      },
      {
        label: "optionB",
        value: "Exploring theories and possibilities"
      }
    ]
  },
  {
    id: "q2",
    question: "When working on a group project, do you?",
    options: [
      {
        label: "optionA",
        value: "Prefer structured plans and clear goals"
      },
      {
        label: "optionB",
        value: "Adapt as you go and keep things flexible"
      }
    ]
  },
  {
    id: "q3",
    question: "When making a decision, do you?",
    options: [
      {
        label: "optionA",
        value: "Focus on facts and logic"
      },
      {
        label: "optionB",
        value: "Consider how it affects people emotionally"
      },
    ]
  },
  {
    id: "q4",
    question: "Do you feel energized by?",
    options: [
      {
        label: "optionA",
        value: "Socializing and working with groups"
      },
      {
        label: "optionB",
        value: "Working alone or in quiet environments"
      },
    ]
  },
  {
    id: "q5",
    question: "How do you approach challenges at work?",
    options: [
      {
        label: "optionA",
        value: "Take control and solve problems quickly"
      },
      {
        label: "optionB",
        value: "Persuade and inspire others to contribute"
      },
      {
        label: "optionC",
        value: "Work patiently and maintain team harmony"
      },
      {
        label: "optionD",
        value: "Analyze all details before making a decision"
      }
    ]
  },
  {
    id: "q6",
    question: "When managing a project, you prefer?",
    options: [
      {
        label: "optionA",
        value: "Setting ambitious goals and leading from the front"
      },
      {
        label: "optionB",
        value: "Engaging people and ensuring collaboration"
      },
      {
        label: "optionC",
        value: "Maintaining a stable workflow and supporting the team"
      },
      {
        label: "optionD",
        value: "Creating detailed plans and ensuring accuracy"
      }
    ]
  },
  {
    id: "q7",
    question: "Which of these job features is most important to you?",
    options: [
      {
        label: "optionA",
        value: "Becoming an expert in my field"
      },
      {
        label: "optionB",
        value: "Leading teams and making decisions"
      },
      {
        label: "optionC",
        value: "Having job security and stability"
      },
      {
        label: "optionD",
        value: "Helping people and making a difference"
      }
    ]
  },
  {
    id: "q8",
    question: "If you had to choose between two job offers, you would pick?",
    options: [
      {
        label: "optionA",
        value: "A stable job with a clear career path"
      },
      {
        label: "optionB",
        value: "A high-risk, high-reward opportunity"
      },
    ]
  },
  {
    id: "q9",
    question: "When you receive negative feedback, you:",
    options: [
      {
        label: "optionA",
        value: "Take it constructively and improve"
      },
      {
        label: "optionB",
        value: "Feel discouraged but eventually bounce back"
      },
      {
        label: "optionC",
        value: "Get defensive and justify your actions"
      }
    ]
  },
  {
    id: "q10",
    question: "How do you handle workplace conflict?",
    options: [
      {
        label: "optionA",
        value: "Address it immediately and resolve the issue"
      },
      {
        label: "optionB",
        value: "Try to mediate and find common ground"
      },
      {
        label: "optionC",
        value: "Avoid confrontation and let it pass"
      }
    ]
  },
  {
    id: "q11",
    question: "Which situation would stress you the most?",
    options: [
      {
        label: "optionA",
        value: "Constantly having to network and socialize"
      },
      {
        label: "optionB",
        value: "Working alone for long periods without interaction"
      },
      {
        label: "optionC",
        value: "Being in an unpredictable and rapidly changing job"
      },
      {
        label: "optionD",
        value: "Doing the same repetitive tasks every day"
      }
    ]
  },
  {
    id: "q12",
    question: "When you set a goal, how do you pursue it?",
    options: [
      {
        label: "optionA",
        value: "Push myself to achieve it, no matter the obstacles"
      },
      {
        label: "optionB",
        value: "Work steadily but adjust if necessary"
      },
      {
        label: "optionC",
        value: "Lose interest if it takes too long"
      },
    ]
  },
  {
    id: "q13",
    question: "Motivation & Career Drive	If faced with a major career setback, what would you do?",
    options: [
      {
        label: "optionA",
        value: "Work even harder and find another way"
      },
      {
        label: "optionB",
        value: "Reevaluate my options and adjust my plans"
      },
      {
        label: "optionC",
        value: "Feel discouraged and consider quitting"
      },
    ]
  },
  {
    id: "q14",
    question: "What type of work environment suits you best?",
    options: [
      {
        label: "optionA",
        value: "High-pressure, competitive fields"
      },
      {
        label: "optionB",
        value: "Balanced work-life environment"
      },
      {
        label: "optionC",
        value: "Low-stress, stable careers"
      },
    ]
  }
]
/** The question as shown on screen. The saved text is unchanged because scoring matches on it. */
export const questionText = (q: { question: string }) => q.question.replace(/^Motivation & Career Drive\s*/, "");
