"""Validation limits shared by the model, the serializer and (by convention) the Angular form."""

NAME_MIN = 2
NAME_MAX = 120
EMAIL_MAX = 254
PHONE_MAX = 30
PHONE_PATTERN = r"^\+?[0-9 ()/-]{6,30}$"
LOCATION_MAX = 120
MESSAGE_MIN = 20
MESSAGE_MAX = 2000
