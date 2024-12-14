import json

from utils.base_command import BaseCommand


class CleanCommand(BaseCommand):
    def run(self, *args):
        """
        a script the clear the generated html files and data files
        """
        import os
        from config.settings import Settings

        exclude_files = ['index.html', 'CNAME', 'README.md', 'images', 'style', 'data', '404.html']

        processed_users = {}
        with open(Settings.PROCESSED_USERS_FILE, 'r') as f:
            processed_users = json.load(f)
        data_to_process = []
        with open(Settings.DATA_TO_PROCESS, 'r') as f:
            data_to_process = json.load(f)
        data_to_process.extend(processed_users.keys())
        with open(Settings.DATA_TO_PROCESS, 'w') as f:
            json.dump(data_to_process, f, indent=4)
        with open(Settings.PROCESSED_USERS_FILE, 'w') as f:
            json.dump({}, f, indent=4)
        for file in os.listdir(Settings.HTML_OUTPUT_DIR):
            if file in exclude_files or os.path.isdir(file):
                print(f"Skipping {file}")
                continue
            # print("removing", file)
            os.remove(os.path.join(Settings.HTML_OUTPUT_DIR, file))
        row_profiles = os.path.join(Settings.DATA_DIR, 'raw_profiles')
        for file in os.listdir(row_profiles):
            os.remove(os.path.join(row_profiles, file))
