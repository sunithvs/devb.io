import json

from groq import Groq

from config.settings import Settings


class AIDescriptionGenerator:
    """Generate AI-powered profile and activity descriptions"""

    def __init__(self):
        """Initialize Groq client"""
        self.client = Groq(api_key=Settings.get_groq_key())

    def generate_profile_summary(self, profile_data):
        """
        Generate a professional profile summary

        Args:
            profile_data (dict): GitHub user profile data

        Returns:
            str: AI-generated profile summary
        """
        prompt = (
            "Generate a valid JSON developer profile. Return ONLY the JSON object—no commentary, markdown, or prefixes.\n"
            "\nOUTPUT FORMAT:\n"
            "{\n \"about\": \"<4-6 sentence first-person summary>\",\n  \"seo\": {\n    \"title\": \"<Max 10 words: FirstName (@username). Role passionate about [focus]>\",\n    \"description\": \"<120-160 char SEO meta highlighting key skills>\",\n    \"keywords\": \"<8-15 comma-separated keywords: Next.js, long-tail dev terms, specific skills>\"\n  }\n}\n"
            "\nRULES:\n"
            "- All keys required. Use empty strings if data missing—never null\n"
            "- Never alter structure or add fields\n"
            "- About: First-person, 4-6 sentences, developer's strongest technical skills and expertise, no superlatives\n"
            "- SEO title: Max 10 words, follow format\n"
            "- SEO description: 120-160 chars\n"
            "- Keywords: 8-15 SEO phrases (Next.js, frameworks, inferred skills)\n"
            "- Infer conservatively if data sparse\n"
            "\nPROFILE DATA:\n"
            f"Name: {profile_data.get('name', '')}\n"
            f"Username: {profile_data.get('username', '')}\n"
            f"Followers: {profile_data.get('followers', '')}\n"
            f"Public Repos: {profile_data.get('public_repos', '')}\n"
            f"Bio: {profile_data.get('bio', '')}\n"
            f"README: {profile_data.get('readme_content', '')}"
        )

        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional profile summarizer for GitHub developers. create a professional profile summary without any heading ,list or bullet points.",
                },
                {"role": "user", "content": prompt},
            ],
            model="llama-3.1-8b-instant",
        )
        if not response.choices or response.choices[0].message.content == "":
            raise Exception("No response from AI model")

        return json.loads(response.choices[0].message.content)

    def generate_activity_summary(self, contributions):
        """
        Generate AI summary of recent contributions as JSON

        Args:
            contributions (dict): User contributions data

        Returns:
            dict: JSON with repository summaries or empty list if unsuccessful
        """

        def construct_prompt(contributions):
            """Construct a clear prompt for JSON response"""
            return f"""Generate a JSON summary of GitHub activities. 
    Rules:
    - Use this exact JSON format: 
      {{
        "repo_name": {{
          "link": "GitHub repository URL", 
          "summary": "Professional description of recent activities with 1 paragraph only for each repository"
        }}
      }}
    - Only include repositories with significant activities
    - Derive repository link from repo name
    - Be precise and professional

    Contributions data:
    {json.dumps(contributions, indent=2)}
    """

        def validate_json_response(response):
            """Validate the JSON response meets requirements"""
            try:
                parsed = json.loads(response)
                # Check if it matches expected structure
                if not isinstance(parsed, dict):
                    return False

                for repo, details in parsed.items():
                    if not isinstance(details, dict):
                        return False
                    if "link" not in details or "summary" not in details:
                        return False

                return parsed
            except json.JSONDecodeError:
                return False

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a GitHub activity summarizer. Provide a precise JSON summary of repository activities.",
                        },
                        {"role": "user", "content": construct_prompt(contributions)},
                    ],
                    model="llama-3.1-8b-instant",
                    response_format={"type": "json_object"},
                )

                # Extract response content
                response_text = response.choices[0].message.content

                # Validate JSON response
                validated_response = validate_json_response(response_text)
                if validated_response:
                    return validated_response

            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")

        # Return empty list if all attempts fail
        return []
