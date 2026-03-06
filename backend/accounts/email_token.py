from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

signer = TimestampSigner()

def generate_token(email):
    return signer.sign(email)

def verify_token(token, max_age=86400):
    try:
        email = signer.unsign(token, max_age=max_age)
        return email
    except (BadSignature, SignatureExpired):
        return None