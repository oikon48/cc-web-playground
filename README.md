# Claude Code on the Web - Playground

This project is a playground and investigation workspace for **Claude Code on the Web**.

## 🌐 Official Documentation

<https://docs.claude.com/en/docs/claude-code/claude-code-on-the-web>

## 🎨 Documentation Website

**📖 [Claude Code Sandbox ドキュメントサイト](./site/index.html)**

調査結果をわかりやすく解説した静的ウェブサイトです。Claude Codeをリスペクトしたデザインで、インタラクティブなUIを提供します。

**ローカルで表示:**
```bash
cd site
python3 -m http.server 8000
# http://localhost:8000 をブラウザで開く
```

## 📚 Investigation Documentation

This repository contains comprehensive research on the Claude Code on the Web environment:

- **[docs/README.md](./docs/README.md)** - Complete documentation index
- **[docs/01-environment-overview.md](./docs/01-environment-overview.md)** - Environment overview
- **[docs/02-container-lifecycle.md](./docs/02-container-lifecycle.md)** - Container lifecycle details
- **[docs/03-gh-command-workaround.md](./docs/03-gh-command-workaround.md)** - GitHub CLI workaround
- **[docs/04-future-investigation-plan.md](./docs/04-future-investigation-plan.md)** - Future investigation plan
- **[docs/05-data-persistence-boundaries.md](./docs/05-data-persistence-boundaries.md)** - Data persistence investigation
- **[docs/06-tool-execution-policy.md](./docs/06-tool-execution-policy.md)** - Tool execution policy and command capabilities
- **[docs/07-investigation-summary.md](./docs/07-investigation-summary.md)** - Investigation summary and next steps
- **[docs/08-gh-settings-verification.md](./docs/08-gh-settings-verification.md)** - GitHub CLI settings verification results
- **[docs/09-gh-cli-complete-investigation.md](./docs/09-gh-cli-complete-investigation.md)** - Complete gh CLI investigation and setup guide
- **[docs/10-ccusage-hook-setup.md](./docs/10-ccusage-hook-setup.md)** - ccusage Stop Hook setup for automatic token usage reporting

### Quick Links

| Topic | Document |
|-------|----------|
| Getting Started | [01-environment-overview.md](./docs/01-environment-overview.md) |
| System Architecture | [02-container-lifecycle.md](./docs/02-container-lifecycle.md) |
| GitHub Integration | [03-gh-command-workaround.md](./docs/03-gh-command-workaround.md) |
| Data Persistence | [05-data-persistence-boundaries.md](./docs/05-data-persistence-boundaries.md) |
| Tool Execution Policy | [06-tool-execution-policy.md](./docs/06-tool-execution-policy.md) |
| Investigation Summary | [07-investigation-summary.md](./docs/07-investigation-summary.md) |
| GitHub CLI Setup | [09-gh-cli-complete-investigation.md](./docs/09-gh-cli-complete-investigation.md) |
| Token Usage Tracking | [10-ccusage-hook-setup.md](./docs/10-ccusage-hook-setup.md) |
| Future Research | [04-future-investigation-plan.md](./docs/04-future-investigation-plan.md) |

## 🎯 What's Inside

- ✅ **Interactive Documentation Website** - Claude Code inspired design (2025-10-31)
- ✅ Comprehensive environment investigation
- ✅ Container lifecycle and resource limits analysis
- ✅ Network capabilities and proxy configuration
- ✅ Git setup and authentication details
- ✅ Command execution policies and workarounds
- ✅ Tool execution policy and permission system (2025-10-30)
- ✅ Permission denied mechanism investigation (2025-10-30)
- ✅ .claude/settings.json auto-approval configuration (2025-10-30)
- ✅ GitHub CLI installation and PATH configuration (2025-10-30)
- ✅ Settings file loading timing investigation (2025-10-30)
- ✅ ccusage Stop Hook for automatic token usage reporting (2025-10-30)
- 📋 Future investigation roadmap

## 🚀 Getting Started

1. **Browse the interactive website**: Open [site/index.html](./site/index.html) for an overview
2. Read [docs/01-environment-overview.md](./docs/01-environment-overview.md) for basic understanding
3. Check [docs/README.md](./docs/README.md) for complete navigation
4. Explore specific topics as needed

## 🤝 Contributing

See [docs/README.md](./docs/README.md) for contribution guidelines.
