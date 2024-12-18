import json
import requests

from config.settings import Settings
from modules.html_generator import HTMLProfileGenerator
from utils.base_command import BaseCommand
from utils.logger import ErrorLogger
from utils.user import get_user_data


class FetchCommand(BaseCommand):

    def run(self, *args):
        """
        a script the clear the generated html files and data files
        """
        """Main execution function"""
        # Load users from JSON
        # if --force is passed, process all users in args
        try:
            res = requests.get(Settings.API_URL+"/users")
            users = res.json()
            with open(Settings.DATA_TO_PROCESS, 'r') as f:
                existing_users = json.load(f)
                merged_users = list(set(users + existing_users))
            with open(Settings.DATA_TO_PROCESS, 'w') as f:
                json.dump(merged_users, f, indent=4)
        except json.JSONDecodeError:
            pass
