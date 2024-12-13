#!/usr/bin/env python3
import importlib
import os
import sys

from utils.base_command import BaseCommand


class CommandManager:
    def __init__(self):
        self.commands = {}
        self._discover_commands()

    def _discover_commands(self):
        """
        Dynamically discover and load commands from the utils/commands directory.
        """
        commands_dir = os.path.join(os.path.dirname(__file__), 'utils', 'commands')

        # Ensure the commands directory exists
        if not os.path.exists(commands_dir):
            print(f"Commands directory not found: {commands_dir}")
            return

        # Import all Python files in the commands directory
        for filename in os.listdir(commands_dir):
            if filename.endswith('.py') and filename != '__init__.py':
                module_name = f'utils.commands.{filename[:-3]}'
                try:
                    module = importlib.import_module(module_name)

                    # Find and register command classes
                    for name, obj in module.__dict__.items():
                        if (isinstance(obj, type) and
                                issubclass(obj, BaseCommand) and
                                obj is not BaseCommand):
                            # Use the lowercase class name as the command name
                            command_name = name.lower().replace('command', '')
                            self.commands[command_name] = obj
                except ImportError as e:
                    print(f"Error importing command module {module_name}: {e}")

    def run_command(self, command_name, *args):
        """
        Run a specific command with given arguments.
        """
        if command_name not in self.commands:
            print(f"Unknown command: {command_name}")
            print("Available commands:")
            for cmd in sorted(self.commands.keys()):
                print(f"  {cmd}")
            sys.exit(1)

        # Instantiate and run the command
        command_class = self.commands[command_name]
        command = command_class()
        command.run(*args)


def main():
    # Ensure at least one argument (the command) is provided
    if len(sys.argv) < 2:
        print("Usage: python manage.py <command> [arguments]")
        sys.exit(1)

    # The first argument is the command name
    command_name = sys.argv[1]

    # Remaining arguments are passed to the command
    command_args = sys.argv[2:]

    # Create and run the command
    manager = CommandManager()
    manager.run_command(command_name, *command_args)


if __name__ == '__main__':
    main()
