# Dexter 🤖

Dexter is an autonomous financial research agent that thinks, plans, and learns as it works. It performs analysis using task planning, self-reflection, and real-time market data. Think Claude Code, but built specifically for financial research.

<img width="1098" height="659" alt="Screenshot 2026-01-21 at 5 25 10 PM" src="https://github.com/user-attachments/assets/3bcc3a7f-b68a-4f5e-8735-9d22196ff76e" />

## Table of Contents

- [👋 Overview](#-overview)
- [✅ Prerequisites](#-prerequisites)
- [💻 How to Install](#-how-to-install)
- [🚀 How to Run](#-how-to-run)
- [📊 How to Evaluate](#-how-to-evaluate)
- [🐛 How to Debug](#-how-to-debug)
- [🛠️ Built-in Skills](#️-built-in-skills)
- [🐍 Python REPL Tool](#-python-repl-tool)
- [📱 How to Use with WhatsApp](#-how-to-use-with-whatsapp)
- [🤝 How to Contribute](#-how-to-contribute)
- [📄 License](#-license)


## 👋 Overview

Dexter takes complex financial questions and turns them into clear, step-by-step research plans. It runs those tasks using live market data, checks its own work, and refines the results until it has a confident, data-backed answer.  

**Key Capabilities:**
- **Intelligent Task Planning**: Automatically decomposes complex queries into structured research steps
- **Autonomous Execution**: Selects and executes the right tools to gather financial data
- **Self-Validation**: Checks its own work and iterates until tasks are complete
- **Real-Time Financial Data**: Access to income statements, balance sheets, and cash flow statements
- **Safety Features**: Built-in loop detection and step limits to prevent runaway execution

[![Twitter Follow](https://img.shields.io/twitter/follow/virattt?style=social)](https://twitter.com/virattt) [![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=social&logo=discord)](https://discord.gg/jpGHv2XB6T)

<img width="1042" height="638" alt="Screenshot 2026-02-18 at 12 21 25 PM" src="https://github.com/user-attachments/assets/2a6334f9-863f-4bd2-a56f-923e42f4711e" />


## ✅ Prerequisites

- [Bun](https://bun.com) runtime (v1.0 or higher)
- OpenAI API key (get [here](https://platform.openai.com/api-keys))
- Financial Datasets API key (get [here](https://financialdatasets.ai))
- Exa API key (get [here](https://exa.ai)) - optional, for web search

#### Installing Bun

If you don't have Bun installed, you can install it using curl:

**macOS/Linux:**
```bash
curl -fsSL https://bun.com/install | bash
```

**Windows:**
```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

After installation, restart your terminal and verify Bun is installed:
```bash
bun --version
```

## 💻 How to Install

1. Clone the repository:
```bash
git clone https://github.com/virattt/dexter.git
cd dexter
```

2. Install dependencies with Bun:
```bash
bun install
```

3. Set up your environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your API keys (if using cloud providers)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key (optional)
# GOOGLE_API_KEY=your-google-api-key (optional)
# XAI_API_KEY=your-xai-api-key (optional)
# OPENROUTER_API_KEY=your-openrouter-api-key (optional)

# Institutional-grade market data for agents; AAPL, NVDA, MSFT are free
# FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# (Optional) If using Ollama locally
# OLLAMA_BASE_URL=http://127.0.0.1:11434

# Web Search (Exa preferred, Tavily fallback)
# EXASEARCH_API_KEY=your-exa-api-key
# TAVILY_API_KEY=your-tavily-api-key
```

## 🚀 How to Run

Run Dexter in interactive mode:
```bash
bun start
```

Or with watch mode for development:
```bash
bun dev
```

## 📊 How to Evaluate

Dexter includes an evaluation suite that tests the agent against a dataset of financial questions. Evals use LangSmith for tracking and an LLM-as-judge approach for scoring correctness.

**Run on all questions:**
```bash
bun run src/evals/run.ts
```

**Run on a random sample of data:**
```bash
bun run src/evals/run.ts --sample 10
```

The eval runner displays a real-time UI showing progress, current question, and running accuracy statistics. Results are logged to LangSmith for analysis.

## 🐛 How to Debug

Dexter logs all tool calls to a scratchpad file for debugging and history tracking. Each query creates a new JSONL file in `.dexter/scratchpad/`.

**Scratchpad location:**
```
.dexter/scratchpad/
├── 2026-01-30-111400_9a8f10723f79.jsonl
├── 2026-01-30-143022_a1b2c3d4e5f6.jsonl
└── ...
```

Each file contains newline-delimited JSON entries tracking:
- **init**: The original query
- **tool_result**: Each tool call with arguments, raw result, and LLM summary
- **thinking**: Agent reasoning steps

**Example scratchpad entry:**
```json
{"type":"tool_result","timestamp":"2026-01-30T11:14:05.123Z","toolName":"get_income_statements","args":{"ticker":"AAPL","period":"annual","limit":5},"result":{...},"llmSummary":"Retrieved 5 years of Apple annual income statements showing revenue growth from $274B to $394B"}
```

This makes it easy to inspect exactly what data the agent gathered and how it interpreted results.

## MCP (Model Context Protocol) Support

Dexter supports MCP servers, allowing you to extend its capabilities with external tools. MCP is an open protocol that enables AI applications to connect with external data sources and tools.

### Configuring MCP Servers

Create a `.dexter/mcp.json` file in the project root:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    },
    "kite": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.kite.trade/mcp"]
    }
  }
}
```

### Configuration Options

Each server supports the following options:

| Option | Type | Description |
|--------|------|-------------|
| `command` | string | The command to execute (e.g., `npx`, `node`) |
| `args` | string[] | Command line arguments |
| `env` | object | Environment variables (supports `${VAR}` and `${VAR:-default}` syntax) |
| `cwd` | string | Working directory for the server process |
| `enabled` | boolean | Set to `false` to disable the server (default: `true`) |

### Environment Variable Expansion

You can use environment variables in your MCP config:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Available MCP Servers

Some popular MCP servers you can use:

| Server | Description | Install |
|--------|-------------|---------|
| [Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) | Read/write files | `npx -y @modelcontextprotocol/server-filesystem /path` |
| [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/github) | GitHub API access | `npx -y @modelcontextprotocol/server-github` |
| [Zerodha Kite](https://mcp.kite.trade) | Indian stock trading | `npx -y mcp-remote https://mcp.kite.trade/mcp` |

### Testing MCP Configuration

Run the MCP test script to verify your configuration:

```bash
bun run scripts/test-mcp.ts
```

This will show:
- Configured servers
- Connection status
- Available tools from each server

### How MCP Tools Appear

MCP tools are prefixed with `mcp_{serverName}_` to avoid conflicts. For example:
- `mcp_filesystem_read_file`
- `mcp_kite_get_holdings`
- `mcp_github_create_issue`

The agent will automatically use these tools when appropriate for your queries.

## 🛠️ Built-in Skills

Dexter ships with built-in skills — specialized workflows the agent can invoke for complex tasks. Skills are automatically discovered and made available to the agent.

| Skill | Description |
|-------|-------------|
| `dcf-valuation` | Performs discounted cash flow analysis to estimate intrinsic value per share |
| `senior-data-scientist` | Data science skill for statistical modeling, ML, and advanced analytics |
| `portfolio-rebalancer` | Autonomous portfolio manager — analyzes holdings, scans for opportunities, and executes trades |

**Trigger a skill** by asking naturally — e.g., "rebalance my portfolio", "what is AAPL worth?", "build a predictive model".

### Portfolio Rebalancer

> **EXPERIMENTAL — USE WITH EXTREME CAUTION**
>
> The `portfolio-rebalancer` skill is **experimental** and provided strictly for **educational and research purposes only**. It is **not financial advice**. This skill can connect to your live Zerodha account and **place real orders with real money**.
>
> **By using this skill, you acknowledge that:**
> - This is an AI agent making autonomous trading decisions — it can and will be wrong
> - AI-generated analysis may contain errors, hallucinations, or flawed reasoning
> - Past performance metrics computed by the agent do not guarantee future results
> - The developers accept **no responsibility** for any financial losses incurred
> - You should **never rely solely on this tool** for investment decisions
> - Always review and verify any trades before they are executed
> - Consider using this in a **paper trading / sandbox environment** first
>
> **If you are not comfortable with an AI placing trades on your behalf, do not use this skill.** Consult a qualified financial advisor for investment decisions.

When triggered (e.g., "rebalance my portfolio"), the portfolio rebalancer will:
1. Fetch your live holdings, positions, and available cash from Zerodha
2. Run deep portfolio health analysis (concentration, sector exposure, fundamentals, risk metrics)
3. Gather macro and geopolitical context (RBI policy, FII/DII flows, global events)
4. Scan for new opportunities across Nifty 50, Nifty Next 50, and sector leaders
5. Make a verdict: **Hold** (portfolio is healthy) or **Rebalance** (with specific trades)
6. Place GTT orders via Zerodha for approved trades

Requires: Zerodha Kite MCP server configured in `.dexter/mcp.json` (see [MCP Support](#mcp-model-context-protocol-support)).

## 🐍 Python REPL Tool

Dexter includes a built-in Python code execution tool (`python_repl`) that allows the agent to run Python code directly. This powers data analysis, ML model training, statistical computations, and more.

- Executes inline code or `.py` files
- Supports `pip_install` parameter for installing packages on the fly (e.g., `numpy`, `pandas`, `scikit-learn`, `yfinance`)
- Configurable timeout (default 120s, max 600s)
- Requires Python 3 installed on your system (`python3` or `python` on PATH)

## 📱 How to Use with WhatsApp

Chat with Dexter through WhatsApp by linking your phone to the gateway. Messages you send to yourself are processed by Dexter and responses are sent back to the same chat.

**Quick start:**
```bash
# Link your WhatsApp account (scan QR code)
bun run gateway:login

# Start the gateway
bun run gateway
```

Then open WhatsApp, go to your own chat (message yourself), and ask Dexter a question.

For detailed setup instructions, configuration options, and troubleshooting, see the [WhatsApp Gateway README](src/gateway/channels/whatsapp/README.md).

## 🤝 How to Contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

**Important**: Please keep your pull requests small and focused.  This will make it easier to review and merge.


## 📄 License

This project is licensed under the MIT License.
