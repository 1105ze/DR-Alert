from django.apps import AppConfig

<<<<<<< HEAD

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = "accounts"
=======
class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import accounts.signals
>>>>>>> 68f28fc0c08a7201d700079d57bbd9b1d18e011b
