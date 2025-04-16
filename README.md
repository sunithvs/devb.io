![devb.io Banner](https://devb.io/images/banner.png)

# devb.io 🚀

## Effortless Developer Portfolios Powered by GitHub & AI

[![Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=714905&theme=light)](https://www.producthunt.com/posts/devb-io)

### 📝 Project Overview

devb.io is an innovative platform that automatically generates professional developer portfolios directly from GitHub profiles, leveraging AI to enhance and update professional representations.

### ✨ Key Features

- **One-click GitHub Profile Connection:** Seamlessly integrate your GitHub account to generate your portfolio instantly.
- **Automatic Portfolio Generation:** Transform your GitHub projects and contributions into a polished portfolio.
- **AI-Powered Bio Creation:** Utilize artificial intelligence to craft a compelling biography.
- **Dynamic Activity Tracking:** Keep your portfolio up-to-date with your latest GitHub activities.
- **Zero Maintenance Required:** Set it up once, and let devb.io handle the rest.

### 🌐 Quick Links

- [🚀 Product Hunt](https://www.producthunt.com/posts/devb-io)
- [🚀 Live Website](https://devb.io)
- [🚀 Beta Link](https://beta.devb.io)
- [🎥 Demo Link](https://youtu.be/vS00Z6eDVuc)
- [📄 Documentation](https://docs.devb.io)
- [💬 Community Forum](https://discord.gg/se8fhSWSw9)

### 🛠️ Tech Stack

- **Frontend:** NextJS
- **Backend:** FastAPI
- **Database:** Redis
- **AI Services:** Groq
- **Scripting:** Python

### 🚀 Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/sunithvs/devb.io.git
   ```
2. **Navigate to the Project Directory:**
   ```bash
   cd devb.io
   ```
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the Application:**
   ```bash
   uvicorn main:app --reload
   ```

## 🌱 Environment Setup

To configure your environment variables, follow these steps:

### 1. Copy the Example Environment File

Start by copying the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

This creates a working `.env` file where you can securely store your environment-specific settings.

---

### 2. Environment Variables Explained

| Variable            | Description |
|---------------------|-------------|
| `API_TOKEN_GITHUB`  | Comma-separated list of GitHub API tokens. These help increase your rate limits when accessing GitHub’s APIs. |
| `GROQ_API_KEY`      | Groq API keys used for accessing Groq’s AI models. |
| `API_KEYS`          | Custom API keys your application uses for authenticating users or services. |
| `DEBUG`             | Set to `True` to enable verbose logging for debugging. Keep it `False` in production. |
| `CACHE_ENABLED`     | Enables/disables in-memory or disk-based caching to boost performance. |

---

### 3. Generating Your API Keys

#### 🔑 GitHub API Tokens
1. Go to [GitHub Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)** or use **Fine-grained tokens**
3. Select required scopes (e.g., `repo`, `read:org`, `user`)
4. Copy the token(s) and paste them into the `API_TOKEN_GITHUB` field, comma-separated if multiple

#### 🤖 Groq API Key
1. Sign in at [https://console.groq.com](https://console.groq.com)
2. Navigate to **API Keys**
3. Click **Generate Key** and copy it
4. Paste it into the `GROQ_API_KEY` field (comma-separated if using multiple keys)

#### 🛡️ Application API Keys
1. Use a secure random string generator such as:
   - Linux/macOS: `openssl rand -hex 32`
   - Node.js: `require('crypto').randomBytes(32).toString('hex')`
   - Python: `import secrets; secrets.token_hex(32)`
2. Paste the key(s) into the `API_KEYS` field, separated by commas if multiple


### 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](https://github.com/sunithvs/devb.io/blob/main/CONTRIBUTING.md) for more information.

### 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/sunithvs/devb.io/blob/main/LICENSE) file for details.
