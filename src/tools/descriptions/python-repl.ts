export const PYTHON_REPL_DESCRIPTION = `
Execute Python code directly or run Python script files. Returns stdout, stderr, and exit code.

## When to Use

- Data analysis and manipulation (pandas, numpy, etc.)
- Machine learning model training and evaluation (scikit-learn, xgboost, etc.)
- Statistical computations and hypothesis testing
- File processing (CSV, JSON, Excel, Parquet, etc.)
- Running existing .py scripts
- Data visualization (matplotlib, seaborn — save to file)
- Mathematical computations and simulations

## When NOT to Use

- Simple arithmetic the LLM can do directly
- Financial data retrieval (use financial_search or financial_metrics instead)
- Web browsing or web scraping (use browser instead)
- Web searches (use web_search instead)

## Important Notes

- **Always \`print()\` results** — the LLM only sees stdout/stderr, not variable state.
- **Install packages** via the \`pip_install\` parameter, NOT \`!pip install\` or \`subprocess\`.
- **Plotting**: use \`plt.savefig('output.png')\` instead of \`plt.show()\` — there is no display.
- **No interactive input**: do NOT use \`input()\` — it will hang and timeout.
- **Timeout**: default 120s, max 600s. Set \`timeout_seconds\` for long-running tasks.
- **Inline vs file**: use \`code\` for inline snippets; use \`file_path\` to run existing scripts.

## Usage Examples

### Data Analysis
\`\`\`
code: "import pandas as pd\\ndf = pd.read_csv('data.csv')\\nprint(df.describe())\\nprint(df.head())"
pip_install: ["pandas"]
\`\`\`

### ML Model Training
\`\`\`
code: "from sklearn.model_selection import train_test_split\\nfrom sklearn.ensemble import RandomForestClassifier\\nfrom sklearn.metrics import classification_report\\nimport pandas as pd\\n\\ndf = pd.read_csv('data.csv')\\nX = df.drop('target', axis=1)\\ny = df['target']\\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\\nmodel = RandomForestClassifier()\\nmodel.fit(X_train, y_train)\\nprint(classification_report(y_test, model.predict(X_test)))"
pip_install: ["scikit-learn", "pandas"]
\`\`\`

### Running a Script
\`\`\`
file_path: "train_model.py"
args: ["--epochs", "10", "--lr", "0.001"]
timeout_seconds: 300
\`\`\`
`.trim();
