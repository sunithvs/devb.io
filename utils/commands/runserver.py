import http.server
import signal
import socket
import socketserver
import sys
import webbrowser
from urllib.parse import urlparse

import psutil
import requests
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
		query_params = {}
		if parsed_path.query:
			try:
				# Split the query string into key-value pairs
				pairs = [pair.split('=') for pair in parsed_path.query.split('&') if '=' in pair]
				query_params = dict(pairs)
			except Exception:
				# If parsing fails, use default parameters
				pass
		username = query_params.get('username', 'octocat')

		try:
			# Load profile data dynamically
			data = requests.get(f"{Settings.API_URL}/user/{username}")
			template = self.env.get_template(template_name)
			html_content = template.render(profile=data.json())

			# Send response
			self.send_response(200)
			self.send_header('Content-type', 'text/html')
			self.end_headers()
			self.wfile.write(html_content.encode('utf-8'))

		except Exception as e:
			# Handle any errors (file not found, template error, etc.)
			self.send_error(500, f"Internal Server Error: {str(e)}")


class RunserverCommand(BaseCommand):
	def find_free_port(self):
		"""
		Find and return a free port.
		"""
		with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
			s.bind(('', 0))
			s.listen(1)
			port = s.getsockname()[1]
		return port

	def kill_port_processes(self, port):
		"""
		Attempt to kill processes using the specified port.
		"""
		for proc in psutil.process_iter(['pid', 'name']):
			try:
				# Get process connections
				for conn in proc.connections(kind='inet'):
					if conn.laddr.port == port:
						print(f"Killing process {proc.pid} ({proc.name()}) using port {port}")
						try:
							# Try to terminate gracefully first
							proc.terminate()
							proc.wait(timeout=3)
						except psutil.NoSuchProcess:
							pass
						except psutil.TimeoutExpired:
							# Force kill if not responding
							proc.kill()
			except (psutil.NoSuchProcess, psutil.AccessDenied):
				pass

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
		PORT = 9000  # You can keep a default or use self.find_free_port()

		# Attempt to kill existing processes using the port
		self.kill_port_processes(PORT)
		print(args)
		# Create a custom handler with the Jinja2 environment
		handler = lambda *args, **kwargs: DynamicTemplateHandler(*args, env=env, **kwargs)

		# Configuring the server to allow port reuse
		socketserver.TCPServer.allow_reuse_address = True

		# Start the server
		server = None
		try:
			server = socketserver.TCPServer(("", PORT), handler)
			print(f"Serving template '{template_name}' at http://localhost:{PORT}")

			# Open in browser if requested
			if open_browser:
				webbrowser.open(f'http://localhost:{PORT}')

			# Set up signal handling for clean shutdown
			def signal_handler(sig, frame):
				print('\nShutting down the server...')
				if server:
					server.shutdown()
					server.server_close()
				sys.exit(0)

			signal.signal(signal.SIGINT, signal_handler)
			signal.signal(signal.SIGTERM, signal_handler)

			# Serve until interrupted
			print("Press Ctrl+C to stop the server")
			server.serve_forever()

		except OSError as e:
			if e.errno == 48:  # Address already in use
				print(f"Error: Port {PORT} is already in use.")
				print("Attempted to kill existing processes, but failed.")
				print("Please manually stop the process using the port or choose a different port.")
			else:
				print(f"An error occurred: {e}")
		except Exception as e:
			print(f"Unexpected error: {e}")
		finally:
			if server:
				server.shutdown()
				server.server_close()
