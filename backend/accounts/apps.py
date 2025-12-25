from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # Recommended for new projects
    name = "accounts"

    def ready(self):
        # Import the signals here so they are registered when the app is ready
        import accounts.signals  # This is the key line!
