import json
import os
import webbrowser
import http.server
import socketserver
from typing import Optional
from urllib.parse import urlparse

from jinja2 import Environment, FileSystemLoader

from config.settings import Settings
from utils.base_command import BaseCommand


class DynamicTemplateHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP handler to dynamically render Jinja2 templates
    """

    def __init__(self, *args, env=None, **kwargs):
        self.env = env
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """
        Handle GET requests by dynamically rendering the template
        """
        # Parse the URL to handle different potential routes
        parsed_path = urlparse(self.path)

        # Determine the template to use
        template_name = 'temp_index.html'

        try:
            # Load profile data dynamically
            profile_data = {}
            profile_path = os.path.join(Settings.DATA_DIR, 'raw_profiles', 'sunithvs_profile.json')
            with open(profile_path, 'r') as f:
                profile_data = json.load(f)

            # Render the template
            template = self.env.get_template(template_name)
            html_content = template.render(profile=profile_data)

            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))

        except Exception as e:
            # Handle any errors (file not found, template error, etc.)
            self.send_error(500, f"Internal Server Error: {str(e)}")


class RunserverCommand(BaseCommand):
    def run(self, *args):
        """
        Render and preview a template during development.

        Usage:
        python manage.py runserver [template_name] [--open]

        Options:
        - template_name: Specific template to render (optional)
        - --open: Automatically open the rendered template in browser
        """
        # Create Jinja2 environment
        env = Environment(loader=FileSystemLoader(Settings.TEMPLATES_DIR))

        # Parse arguments
        template_name = 'temp_index.html'
        open_browser = False

        for arg in args:
            if arg == '--open':
                open_browser = True
            elif arg.endswith('.html'):
                template_name = arg

        # Find an available port
        PORT = 8001

        # Create a custom handler with the Jinja2 environment
        handler = lambda *args: DynamicTemplateHandler(*args, env=env)

        # Start the server
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving template '{template_name}' at http://localhost:{PORT}")

            # Open in browser if requested
            if open_browser:
                webbrowser.open(f'http://localhost:{PORT}')

            # Serve until interrupted
            try:
                print("Press Ctrl+C to stop the server")
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServer stopped.")
