import type { QuizModule } from "@/types/quiz";

export const modules: QuizModule[] = [
  {
    id: 1,
    title: "Agentic AI Product Foundations",
    description:
      "Learn how AI agents work, identify where AI can create product value, and make better decisions about when and how to apply AI in products.",
    questions: [
      {
        id: 1,
        section: "AI Product Thinking",
        difficulty: "Easy",
        question:
          "What should a PM consider when deciding whether to build an AI product for a specific workflow?",
        options: [
          {
            label: "A",
            text: "Only whether the latest AI model can perform the task",
          },
          {
            label: "B",
            text: "Domain expertise, data availability, model readiness, and the competitive landscape",
          },
          { label: "C", text: "Only the size of the engineering team" },
          { label: "D", text: "Whether competitors are already using AI" },
        ],
        answer: "B",
      },
      {
        id: 2,
        section: "AI Product Thinking",
        difficulty: "Easy",
        question:
          "Which type of workflow is generally more suitable for an AI agent?",
        options: [
          {
            label: "A",
            text: "A simple task with a fixed rule and predictable output",
          },
          {
            label: "B",
            text: "A workflow requiring complex decisions and adapting to changing conditions",
          },
          {
            label: "C",
            text: "A calculation that follows a predefined formula",
          },
          {
            label: "D",
            text: "A workflow that requires no contextual information",
          },
        ],
        answer: "B",
      },
      {
        id: 3,
        section: "AI Product Thinking",
        difficulty: "Easy",
        question:
          "What should an AI Product Manager focus on as AI capabilities improve?",
        options: [
          { label: "A", text: "Building better AI models from scratch" },
          {
            label: "B",
            text: "Creating better applications of AI that solve real business problems",
          },
          { label: "C", text: "Replacing all existing workflows with AI" },
          { label: "D", text: "Using AI in every possible product area" },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "AI Ecosystem",
        difficulty: "Medium",
        question:
          "Which three categories represent major opportunity areas in the Agentic AI ecosystem?",
        options: [
          { label: "A", text: "AGI, AI Tooling, and Vertical Applications" },
          { label: "B", text: "Chatbots, Databases, and APIs" },
          { label: "C", text: "Hardware, Networking, and Storage" },
          { label: "D", text: "Search, Social Media, and E-commerce" },
        ],
        answer: "A",
      },
      {
        id: 5,
        section: "AI Ecosystem",
        difficulty: "Easy",
        question:
          "What is the primary role of AI tooling in the AI ecosystem?",
        options: [
          { label: "A", text: "Building only consumer-facing chatbots" },
          {
            label: "B",
            text: "Providing horizontal capabilities and infrastructure for building AI applications",
          },
          { label: "C", text: "Replacing domain-specific applications" },
          { label: "D", text: "Training every AI model from scratch" },
        ],
        answer: "B",
      },
      {
        id: 6,
        section: "Technical Foundations",
        difficulty: "Medium",
        question:
          "What are the four components of the Intelligence Loop for an AI agent?",
        options: [
          { label: "A", text: "Data, Model, API, Database" },
          {
            label: "B",
            text: "Knowledge, Tools, Signals/Memory, Guardrails/Feedback",
          },
          { label: "C", text: "Prompt, Context, Model, Output" },
          { label: "D", text: "Input, Processing, Storage, Output" },
        ],
        answer: "B",
      },
      {
        id: 7,
        section: "Technical Foundations",
        difficulty: "Easy",
        question: "Which type of machine learning learns from labeled examples?",
        options: [
          { label: "A", text: "Unsupervised Learning" },
          { label: "B", text: "Reinforcement Learning" },
          { label: "C", text: "Supervised Learning" },
          { label: "D", text: "Generative Learning" },
        ],
        answer: "C",
      },
      {
        id: 8,
        section: "Technical Foundations",
        difficulty: "Medium",
        question:
          "What is a key difference between an agentic AI system and a traditional rule-based system?",
        options: [
          {
            label: "A",
            text: "Agentic AI can handle complex decisions and evolving rule sets",
          },
          { label: "B", text: "Agentic AI only works with structured data" },
          { label: "C", text: "Rule-based systems always require an LLM" },
          {
            label: "D",
            text: "Agentic AI cannot work with unstructured data",
          },
        ],
        answer: "A",
      },
      {
        id: 9,
        section: "Technical Foundations",
        difficulty: "Easy",
        question:
          "What are tokens and context windows primarily related to?",
        options: [
          {
            label: "A",
            text: "How an LLM processes and handles information during an interaction",
          },
          { label: "B", text: "How databases store customer records" },
          { label: "C", text: "How APIs authenticate users" },
          { label: "D", text: "How AI agents deploy to production" },
        ],
        answer: "A",
      },
    ],
  },
  {
    id: 2,
    title: "Agent Context & Product Roadmapping",
    description:
      "Learn how agents manage context, and practice turning an AI agent idea into a roadmap you can execute with cross-functional teams.",
    questions: [
      {
        id: 1,
        section: "AI Product Sense",
        difficulty: "Easy",
        question:
          "When building an AI product, why should a PM break the solution into smaller components?",
        options: [
          { label: "A", text: "To increase the number of AI features" },
          {
            label: "B",
            text: "To identify risks and validate assumptions incrementally",
          },
          { label: "C", text: "To avoid working with engineering teams" },
          { label: "D", text: "To eliminate the need for user feedback" },
        ],
        answer: "B",
      },
      {
        id: 2,
        section: "AI Product Sense",
        difficulty: "Easy",
        question:
          "Which approach is recommended when scoping an AI product for an MVP?",
        options: [
          { label: "A", text: "Automate the entire workflow from day one" },
          { label: "B", text: "Start with the most complex AI capability" },
          {
            label: "C",
            text: "Focus on a narrow, high-value use case and validate the riskiest assumptions",
          },
          {
            label: "D",
            text: "Build every feature before testing with users",
          },
        ],
        answer: "C",
      },
      {
        id: 3,
        section: "AI Product Sense",
        difficulty: "Easy",
        question:
          "What is the purpose of prioritizing AI product features into different phases?",
        options: [
          { label: "A", text: "To delay user feedback" },
          {
            label: "B",
            text: "To incrementally add capabilities while validating the product",
          },
          {
            label: "C",
            text: "To make the engineering process more complicated",
          },
          { label: "D", text: "To avoid defining an MVP" },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "AI Agent & Context",
        difficulty: "Medium",
        question:
          "What is the key difference between standard RAG and Agentic RAG?",
        options: [
          {
            label: "A",
            text: "Standard RAG uses AI, while Agentic RAG does not",
          },
          {
            label: "B",
            text: "Agentic RAG can reason, make decisions, use tools, and perform multiple steps",
          },
          {
            label: "C",
            text: "Standard RAG always requires multiple agents",
          },
          { label: "D", text: "Agentic RAG does not retrieve information" },
        ],
        answer: "B",
      },
      {
        id: 5,
        section: "AI Agent & Context",
        difficulty: "Medium",
        question:
          "Why can subagents be useful when an AI system needs to process a large amount of information?",
        options: [
          {
            label: "A",
            text: "They allow different tasks to work with separate context windows",
          },
          { label: "B", text: "They remove the need for an AI model" },
          {
            label: "C",
            text: "They permanently increase the model's context window",
          },
          { label: "D", text: "They eliminate the need for retrieval" },
        ],
        answer: "A",
      },
      {
        id: 6,
        section: "AI Agent & Context",
        difficulty: "Medium",
        question:
          "Which sequence best represents an agentic workflow?",
        options: [
          {
            label: "A",
            text: "Retrieve → Generate → Deploy → Monitor",
          },
          { label: "B", text: "Prompt → Train → Test → Deploy" },
          { label: "C", text: "Perceive → Plan → Act → Reflect" },
          { label: "D", text: "Input → Search → Store → Delete" },
        ],
        answer: "C",
      },
      {
        id: 7,
        section: "AI Product Ecosystem",
        difficulty: "Easy",
        question:
          "What problem does MCP help solve for AI applications?",
        options: [
          { label: "A", text: "Training larger language models" },
          {
            label: "B",
            text: "Connecting AI workflows with external tools and systems",
          },
          { label: "C", text: "Replacing databases" },
          { label: "D", text: "Increasing model parameters" },
        ],
        answer: "B",
      },
      {
        id: 8,
        section: "AI Product Ecosystem",
        difficulty: "Easy",
        question:
          "Which Claude product is designed for developers working directly with codebases, tests, bugs, and Git workflows?",
        options: [
          { label: "A", text: "Claude Chat" },
          { label: "B", text: "Claude CoWork" },
          { label: "C", text: "Claude Code" },
          { label: "D", text: "Claude Projects" },
        ],
        answer: "C",
      },
      {
        id: 9,
        section: "AI Product Ecosystem",
        difficulty: "Easy",
        question:
          "What is the role of CLAUDE.md in a Claude Code project?",
        options: [
          { label: "A", text: "It stores the application's database" },
          {
            label: "B",
            text: "It provides project-level context, rules, and instructions to Claude",
          },
          { label: "C", text: "It contains the model's training data" },
          { label: "D", text: "It replaces the project's README" },
        ],
        answer: "B",
      },
    ],
  },
  {
    id: 3,
    title: "AI Agent Evaluation, KPIs & Observability",
    description:
      "Learn how to evaluate AI agents, define meaningful KPIs, monitor agent performance, and establish measurable launch criteria for reliable AI products.",
    questions: [
      {
        id: 1,
        section: "AI Product Evaluation",
        difficulty: "Easy",
        question:
          "Why is evaluation important when building an AI agent?",
        options: [
          { label: "A", text: "It eliminates the need for user feedback" },
          {
            label: "B",
            text: "It helps measure performance and guide iterative improvement",
          },
          {
            label: "C",
            text: "It guarantees the agent will never make mistakes",
          },
          { label: "D", text: "It removes the need for testing" },
        ],
        answer: "B",
      },
      {
        id: 2,
        section: "AI Product Evaluation",
        difficulty: "Easy",
        question:
          "Which three dimensions make up the HHH evaluation framework?",
        options: [
          { label: "A", text: "Helpful, Honest, Harmless" },
          { label: "B", text: "Helpful, Human, Hybrid" },
          { label: "C", text: "Honest, Human, High-performing" },
          { label: "D", text: "Harmless, Helpful, High-speed" },
        ],
        answer: "A",
      },
      {
        id: 3,
        section: "AI Product Evaluation",
        difficulty: "Medium",
        question:
          "What is the purpose of creating a golden dataset for an AI product?",
        options: [
          { label: "A", text: "To increase the model's context window" },
          {
            label: "B",
            text: "To provide representative queries and expected outputs for evaluation",
          },
          {
            label: "C",
            text: "To replace human evaluation completely",
          },
          {
            label: "D",
            text: "To reduce the number of users testing the product",
          },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "AI Agent Metrics",
        difficulty: "Easy",
        question:
          "Which metric would best help a PM understand whether an AI agent is completing the intended user task?",
        options: [
          { label: "A", text: "Task completion rate" },
          { label: "B", text: "Number of model parameters" },
          { label: "C", text: "Database size" },
          { label: "D", text: "Number of UI components" },
        ],
        answer: "A",
      },
      {
        id: 5,
        section: "AI Agent Metrics",
        difficulty: "Easy",
        question:
          "What is the role of a North Star Metric for an AI agent?",
        options: [
          {
            label: "A",
            text: "Track every technical detail of the system",
          },
          {
            label: "B",
            text: "Provide a high-level measure of the product's core outcome",
          },
          { label: "C", text: "Measure only infrastructure uptime" },
          { label: "D", text: "Replace all other product metrics" },
        ],
        answer: "B",
      },
      {
        id: 6,
        section: "AI Agent Metrics",
        difficulty: "Medium",
        question:
          "Which of the following is an example of an efficiency metric for an AI agent?",
        options: [
          { label: "A", text: "Cost per task" },
          { label: "B", text: "Number of product managers" },
          { label: "C", text: "Number of UI screens" },
          { label: "D", text: "Size of the engineering team" },
        ],
        answer: "A",
      },
      {
        id: 7,
        section: "AI Agent Observability & Launch",
        difficulty: "Medium",
        question:
          "What should a PM define when setting up observability for an AI agent?",
        options: [
          { label: "A", text: "Only the programming language" },
          {
            label: "B",
            text: "Success, failure, alert thresholds, and out-of-bounds behavior",
          },
          { label: "C", text: "Only the model provider" },
          { label: "D", text: "Only the infrastructure architecture" },
        ],
        answer: "B",
      },
      {
        id: 8,
        section: "AI Agent Observability & Launch",
        difficulty: "Medium",
        question:
          "Why should AI products use progressive launch criteria?",
        options: [
          {
            label: "A",
            text: "To avoid measuring the product during early stages",
          },
          {
            label: "B",
            text: "To gradually increase quality expectations as the product scales",
          },
          { label: "C", text: "To eliminate beta testing" },
          { label: "D", text: "To launch to all users immediately" },
        ],
        answer: "B",
      },
      {
        id: 9,
        section: "AI Agent Observability & Launch",
        difficulty: "Medium",
        question:
          "As an AI product scales, what approach can help scale evaluation?",
        options: [
          { label: "A", text: "Rely only on manual testing" },
          { label: "B", text: "Stop evaluating after launch" },
          {
            label: "C",
            text: "Combine human evaluation with automated evaluation methods",
          },
          {
            label: "D",
            text: "Evaluate only infrastructure performance",
          },
        ],
        answer: "C",
      },
    ],
  },
  {
    id: 4,
    title: "Tools, MCP & Agent Integrations",
    description:
      "Learn how AI agents use tools to take actions, understand the role of MCP, and integrate external tools and systems into agent workflows.",
    locked: true,
    questions: [],
  },
  {
    id: 5,
    title: "Lead AI at Scale: Governance, Ethics & Org Design",
    description:
      "Most AI PMs know how to build. Fewer know how to lead. Master the responsible AI frameworks, regulatory essentials, and org structures that separate great AI products from good ones.",
    locked: true,
    questions: [],
  },
];
