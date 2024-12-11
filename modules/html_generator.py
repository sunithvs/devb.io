import os
from random import choice

from jinja2 import Environment, FileSystemLoader

from config.settings import Settings


class HTMLProfileGenerator:
    """Generate HTML profiles using Jinja2 templates"""

    def __init__(self):
        """Initialize Jinja2 environment"""
        self.env = Environment(loader=FileSystemLoader(Settings.TEMPLATES_DIR))

    def generate_profile_html(self, profile_data, output_dir):
        """
        Generate HTML profile from template

        Args:
            profile_data (dict): User profile data
            contributions_data (dict): User contributions data
            output_dir (str): Directory to save HTML file
        """
        # Select a template (could be randomized or selected based on profile)
        template = self.env.get_template(choice(Settings.TEMPLATE_FILES))

        # Render the template
        html_content = template.render(
            profile=profile_data,
        )

        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Save HTML file
        output_path = os.path.join(output_dir, f"{profile_data['username']}.html")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
