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
            "Craft a Concise, SEO-optimized first-person profile description that:"
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
                    "content": "You are a professional profile summarizer for GitHub developers. create a professional profile summary without any heading ,list or bullet points."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant"
        )
        print(response)
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
                    if 'link' not in details or 'summary' not in details:
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
                            "content": "You are a GitHub activity summarizer. Provide a precise JSON summary of repository activities."
                        },
                        {
                            "role": "user",
                            "content": construct_prompt(contributions)
                        }
                    ],
                    model="llama-3.1-8b-instant",
                response_format={"type": "json_object"}
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
