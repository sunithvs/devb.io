import json

from groq import Groq

from config.settings import Settings


class AIDescriptionGenerator:
    """Generate AI-powered profile and activity descriptions"""

    def __init__(self):
        """Initialize Groq client"""
        self.client = Groq(api_key=Settings.get_groq_key())

    def generate_seo_contents(self, profile_data: dict):
        """
        Generate a professional SEO-optimized profile content like title, description, keywords

        Args:
            profile_data (dict): GitHub user profile data

        Returns:
            dict: AI-generated SEO-optimized profile content
        """
        prompt = (
            "Generate a concise, professional, and SEO-optimized profile snippet for a developer profile page."
            "\n\nReturn the output strictly in the following JSON format (without any additional commentary):"
            '\n{\n  "title": "<Max 10 words. Format: FirstName (@username). Role passionate about [what they do]>",'
            '\n  "description": "<Max 30 words (120–160 characters). Meta-style description that highlights skills and invites engagement>",'
            '\n  "keywords": "<8–15 comma-separated keywords or phrases. Focus on Next.js-related terms, long-tail SEO phrases, and specific skills>"\n}'
            "\n\nUse this input data to personalize the content, handling missing or empty fields gracefully:"
            f"\n- Name: {profile_data.get('name', 'Anonymous Developer')}"
            f"\n- Username: {profile_data.get('username', 'username')}"
            f"\n- Followers: {profile_data.get('followers', 0)} (highlight if over 500)"
            f"\n- Public Repositories: {profile_data.get('public_repos', 0)} (highlight if over 20)"
            f"\n- Bio: {profile_data.get('bio', '')} (infer core skills or passions)"
            f"\n- README: {profile_data.get('readme_content', '')} (extract unique traits or standout projects)"
            "\n\nIf data is sparse, infer likely skills or focus areas. Avoid filler or generic phrases. Prioritize precision and clarity."
        )

        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an SEO-optimized profile content generator for developer portfolios and GitHub profiles. Create search engine friendly, professional profile summaries that enhance discoverability and professional presence. Generate content in natural paragraph format without headings, lists, or bullet points. Focus on keyword integration, meta-friendly descriptions, and compelling copy that drives engagement and showcases technical expertise effectively. Your output should be properly formatted JSON when requested, with each field containing well-crafted, SEO-optimized content.",
                },
                {"role": "user", "content": prompt},
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )
        if not response.choices or response.choices[0].message.content == "":
            raise Exception("No response from AI model")
        try:
            result = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError as e:
            raise Exception(f"AI response was not valid JSON. Content: {response.choices[0].message.content}") from e

        title = result["title"]
        description = result["description"]
        keywords = result["keywords"]

        if not (title and description and keywords):
            missing = []
            if not title:
                missing.append("title")
            if not description:
                missing.append("description")
            if not keywords:
                missing.append("keywords")
            raise Exception(
                f"AI response missing required SEO fields: {', '.join(missing)}. Received: {result}"
            )
        return {
            "title": title,
            "description": description,
            "keywords": keywords,
        }

    def generate_profile_summary(self, profile_data):
        """
        Generate a professional profile summary

        Args:
            profile_data (dict): GitHub user profile data

        Returns:
            str: AI-generated profile summary
        """
        prompt = (
            "Write only the final profile summary text — no introductions, no explanations, and no meta sentences."
            "\nCraft a Concise, SEO-optimized first-person profile description that:"
            "\n- Highlights the developer's strongest technical skills and expertise"
            "\n- Concise and on to the point"
            "\n- Uses simple, direct language without excessive superlatives"
            "\n- Incorporates unique details from the profile, bio and readme.md (if available)"
            "\n- Limits the bio to 2-3 sentences"
            "\n\nProfile Details:"
            f"\nName: {profile_data['name']}"
            f"\n- Followers: {profile_data['followers']} (indicating professional network and influence)"
            f"\n- Public Repositories: {profile_data['public_repos']} (demonstrating active development)"
            f"\n- Bio: {profile_data['bio']}"
            "\n\nGenerate a short, engaging summary."
            f"\n- README: {profile_data['readme_content']}"
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

        return response.choices[0].message.content

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
