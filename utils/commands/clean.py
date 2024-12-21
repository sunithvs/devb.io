import json
import os
from datetime import datetime
from utils.base_command import BaseCommand
from config.settings import Settings


class CleanCommand(BaseCommand):
    def __init__(self):
        super().__init__()
        self.analytics_file = os.path.join(Settings.DATA_DIR, 'analytics.json')

    def get_default_analytics(self):
        """
        Return default analytics structure
        """
        return {
            'total_users_ever_processed': [],
            'total_users_count': 0,
            'cleaning_operations': []
        }

    def update_analytics(self, processed_users):
        """
        Update analytics file with cleaning operation data
        """
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.analytics_file), exist_ok=True)

        # Load existing analytics or create new
        analytics = self.get_default_analytics()
        if os.path.exists(self.analytics_file):
            try:
                with open(self.analytics_file, 'r') as f:
                    file_content = f.read().strip()
                    if file_content:  # Only try to parse if file is not empty
                        analytics = json.loads(file_content)
            except (json.JSONDecodeError, FileNotFoundError) as e:
                print(f"Warning: Could not read analytics file: {e}")
                analytics = self.get_default_analytics()

        # Convert total_users_ever_processed to set for uniqueness
        try:
            if isinstance(analytics['total_users_ever_processed'], list):
                current_users = set(analytics['total_users_ever_processed'])
            elif isinstance(analytics['total_users_ever_processed'], int):
                current_users = set()
            else:
                current_users = set(analytics['total_users_ever_processed'])
        except KeyError:
            current_users = set()

        # Add new users to the set
        current_users.update(processed_users.keys())

        # Create new cleaning operation entry
        operation = {
            'timestamp': datetime.now().isoformat(),
            'users_cleaned': len(processed_users),
            'user_names': list(processed_users.keys())
        }

        # Update analytics
        analytics['total_users_ever_processed'] = list(current_users)
        analytics['total_users_count'] = len(current_users)
        analytics['cleaning_operations'] = analytics.get('cleaning_operations', [])
        if operation:
            analytics['cleaning_operations'].append(operation)
            # if len(analytics['cleaning_operations']) > 10:
            #     analytics['cleaning_operations'].pop(0)

        # Save updated analytics with error handling
        try:
            with open(self.analytics_file, 'w') as f:
                json.dump(analytics, f, indent=4)
        except Exception as e:
            print(f"Warning: Could not write to analytics file: {e}")

    def run(self, *args):
        """
        A script to clear the generated html files and data files while tracking analytics
        """
        exclude_files = ['index.html', 'CNAME', 'README.md', 'images', 'style', 'data', '404.html', 'poster']

        # Load processed users with error handling
        processed_users = {}
        try:
            with open(Settings.PROCESSED_USERS_FILE, 'r') as f:
                processed_users = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Warning: Could not read processed users file: {e}")
            processed_users = {}

        # Update analytics before cleaning
        self.update_analytics(processed_users)

        # Clear processed users file
        try:
            with open(Settings.PROCESSED_USERS_FILE, 'w') as f:
                json.dump({}, f, indent=4)
        except Exception as e:
            print(f"Warning: Could not clear processed users file: {e}")

        # Clean HTML files
        for file in os.listdir(Settings.HTML_OUTPUT_DIR):
            if file in exclude_files or os.path.isdir(file):
                print(f"Skipping {file}")
                continue
            file_path = os.path.join(Settings.HTML_OUTPUT_DIR, file)
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Warning: Could not remove file {file}: {e}")

        # Clean raw profiles
        raw_profiles = os.path.join(Settings.DATA_DIR, 'raw_profiles')
        if os.path.exists(raw_profiles):
            for file in os.listdir(raw_profiles):
                try:
                    os.remove(os.path.join(raw_profiles, file))
                except Exception as e:
                    print(f"Warning: Could not remove raw profile {file}: {e}")
