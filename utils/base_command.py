from abc import ABC, abstractmethod


class BaseCommand(ABC):
    """
    Abstract base class for management commands.
    Similar to Django's BaseCommand, but simplified.
    """

    def __init__(self):
        """
        Initialize the command.
        Subclasses can override this to add custom initialization.
        """
        pass

    @abstractmethod
    def run(self, *args):
        """
        Main method to execute the command.
        Must be implemented by subclasses.

        :param args: Command-line arguments passed to the command
        """
        raise NotImplementedError("Subclasses must implement the run method")

    def add_arguments(self, parser):
        """
        Optional method to add command-specific arguments.
        Can be overridden by subclasses to customize argument parsing.

        :param parser: Argument parser object
        """
        pass
