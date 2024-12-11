import json
import os
from datetime import datetime

from config.settings import Settings


class ErrorLogger:
    """Centralized error logging utility"""

    @staticmethod
    def log_error(username, error_message,):
        """
        Log errors for specific users

        Args:
            username (str): GitHub username
            error_message (str): Description of the error
        """
        error_log_path = os.path.join(Settings.LOGS_DIR, 'error_logs.json')

        # Read existing errors
        try:
            with open(error_log_path, 'r') as f:
                error_logs = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            error_logs = {}

        # Add new error entry
        error_logs[username] = {
            'timestamp': datetime.now().isoformat(),
            'error': error_message
        }

        # Write updated error logs
        with open(error_log_path, 'w') as f:
            json.dump(error_logs, f, indent=4)
