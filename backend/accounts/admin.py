from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import User, Patient, Doctor, DoctorVerification, RetinalImage, PredictionResult, DoctorValidation, Notification
import base64


# =========================
# USER ADMIN (clean view)
# =========================
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "role_display",
        "gender_display",
        "date_of_birth",
        'created_at'
    )

    fields = (
        "profile_image_preview",   # ✅ ADD
        "profile_size", 
        "username",
        "email",
        "role",
        "gender",
        "date_of_birth",
        "license_preview",
        "license_size",
        'created_at'
    )

    readonly_fields = (
        "profile_image_preview",
        "profile_size",
        "license_preview",
        "license_size",
        'created_at'
    )

    def role_display(self, obj):
        return obj.get_role_display()
    role_display.short_description = "Role"

    def gender_display(self, obj):
        return obj.get_gender_display()
    gender_display.short_description = "Gender"

    def license_preview(self, obj):
        if not obj.license_image:
            return "No license image"
        b64 = base64.b64encode(obj.license_image).decode()
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:150px;" />',
            b64
        )
    
    def license_size(self, obj):
        size = obj.license_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    license_size.short_description = "License Size"

    def profile_image_preview(self, obj):
        if not obj.profile_image:
            return "No profile image"

        b64 = base64.b64encode(obj.profile_image).decode()
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:150px;" />',
            b64
        )

    def profile_size(self, obj):
        size = obj.profile_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        return f"{size / (1024 * 1024):.2f} MB"

    profile_size.short_description = "Profile Image Size"




# =========================
# DOCTOR PROFILE
# =========================
@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        "doctor_name",
        "role",
        "verification_status",
        "applied_at",
    )

    fields = (
        "profile_image_preview",   # ✅ ADD
        "profile_size", 
        "doctor_name",
        "email",
        "gender",
        "date_of_birth",
        "role",
        "specialization",
        "license_preview",
        "license_size",  # ✅ HERE
        "verification_status",
        "applied_at",
    )

    readonly_fields = (
        "profile_image_preview",   # ✅ ADD
        "profile_size", 
        "doctor_name",
        "email",
        "gender",
        "date_of_birth",
        "role",
        "specialization",
        "license_preview",
        "license_size",  # ✅ HERE
        "verification_status",
        "applied_at",
    )

    def doctor_name(self, obj):
        return obj.user.username

    def email(self, obj):
        return obj.user.email

    def role(self, obj):
        return obj.user.get_role_display()
    role.short_description = "Role"

    def gender(self, obj):
        return obj.user.get_gender_display()

    def date_of_birth(self, obj):
        return obj.user.date_of_birth

    def verification_status(self, obj):
        if not hasattr(obj, "verification"):
            return format_html('<span style="color:orange; font-weight:bold;">Pending</span>')

        status = obj.verification.status
        colors = {
            'pending': 'orange',
            'verified': 'green',
            'rejected': 'red',
        }

        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            colors.get(status, 'gray'),
            obj.verification.get_status_display()
        )

    verification_status.short_description = "Status"

    def license_preview(self, obj):
        if not obj.license_image:
            return "No license uploaded"

        try:
            b64 = base64.b64encode(obj.license_image).decode("utf-8")
            return format_html(
                '<img src="data:image/jpeg;base64,{}" style="max-height:300px;" />',
                b64
            )
        except Exception as e:
            return f"Error: {e}"
    
    def license_size(self, obj):
        size = obj.license_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    license_size.short_description = "License Size"

    def profile_image_preview(self, obj):
        if not obj.user.profile_image:
            return "No profile image"

        b64 = base64.b64encode(obj.user.profile_image).decode("utf-8")
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:150px;" />',
            b64
        )

    def profile_size(self, obj):
        size = obj.user.profile_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        return f"{size / (1024 * 1024):.2f} MB"

    profile_size.short_description = "Profile Image Size"

    




# =========================
# PATIENT PROFILE
# =========================
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "gender",
        "date_of_birth",
        "created_at",
    )

    fields = (
        "profile_image_preview",   # ✅ ADD
        "profile_size", 
        "username",
        "email",
        "role",
        "gender",
        "date_of_birth",
        "created_at",
    )

    readonly_fields = (
        "username",
        "email",
        "role",
        "gender",
        "profile_image_preview",   # ✅ ADD
        "profile_size", 
        "date_of_birth",
        "created_at",
    )

    # ---- Computed fields from User ----
    def username(self, obj):
        return obj.user.username

    def email(self, obj):
        return obj.user.email

    def role(self, obj):
        return obj.user.get_role_display()

    def gender(self, obj):
        return obj.user.get_gender_display()

    def date_of_birth(self, obj):
        return obj.user.date_of_birth
    
    def profile_image_preview(self, obj):
        if not obj.user.profile_image:
            return "No profile image"

        b64 = base64.b64encode(obj.user.profile_image).decode("utf-8")
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:150px;" />',
            b64
        )

    def profile_size(self, obj):
        size = obj.user.profile_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        return f"{size / (1024 * 1024):.2f} MB"

    profile_size.short_description = "Profile Image Size"


    username.short_description = "Username"
    email.short_description = "Email"
    role.short_description = "Role"
    gender.short_description = "Gender"
    date_of_birth.short_description = "Date of Birth"



# =========================
# DOCTOR VERIFICATION (MAIN FEATURE)
# =========================
@admin.register(DoctorVerification)
class DoctorVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'doctor_username',
        'applied_at',
        'status',
        'status_display',
        'verified_by',
        'verified_at',
        'reason_short',
        'license_preview_small',
    )

    list_filter = ('status', 'applied_at')
    search_fields = ('doctor__user__username', 'doctor__user__email', 'reason')
    readonly_fields = ('applied_at', 'doctor', 'verified_at', 'license_preview_full')
    list_editable = ('status',)

    fields = (
        'doctor',
        'applied_at',
        'status',
        'verified_by',
        'verified_at',
        'reason',
        'license_preview_full',
        'license_size',
    )

    readonly_fields = (
    'applied_at',
    'doctor',
    'verified_at',
    'verified_by',
    'license_preview_full',
    'license_size',  # ✅ ADD THIS
    )

    def doctor_username(self, obj):
        return obj.doctor.user.username
    doctor_username.short_description = "Doctor"

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'verified': 'green',
            'rejected': 'red',
        }
        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_display.short_description = "Status"

    def reason_short(self, obj):
        return obj.reason[:60] + "..." if obj.reason else "-"
    reason_short.short_description = "Reason / Notes"

    def license_preview_small(self, obj):
        image = obj.license_image
        if not image:
            return "No image"

        try:
            b64 = base64.b64encode(image).decode("utf-8")
            return format_html(
                '<img src="data:image/jpeg;base64,{}" style="max-height:60px; border-radius:4px;" />',
                b64
            )
        except Exception as e:
            return f"Error: {e}"

    license_preview_small.short_description = "License"

    def license_preview_full(self, obj):
        image = obj.license_image
        if not image:
            return "No license image"

        try:
            b64 = base64.b64encode(image).decode("utf-8")
            return format_html(
                '<img src="data:image/jpeg;base64,{}" style="max-width:100%; max-height:600px;" />',
                b64
            )
        except Exception as e:
            return f"Error: {e}"

    license_preview_full.short_description = "Full Preview"

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            obj.verified_by = request.user
            obj.verified_at = timezone.now()
            if obj.status == 'rejected' and not obj.reason:
                obj.reason = "Rejected by admin"
        super().save_model(request, obj, form, change)

    def license_size(self, obj):
        size = obj.license_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    license_size.short_description = "License Size"

@admin.register(RetinalImage)
class RetinalImageAdmin(admin.ModelAdmin):
    list_display = (
        'uploader_name',
        'uploaded_by_type',
        'uploaded_at',
        'image_size_display',
    )

    list_filter = ('uploaded_by_type', 'uploaded_at')
    search_fields = ('patient__user__username', 'doctor__user__username')
    readonly_fields = ('uploaded_at', 'image_preview', 'image_size_display')

    fields = (
        'uploaded_by_type',
        'uploader_display',       # ← NEW: this will show the correct one
        'uploaded_at',
        'selected_doctor',
        'image_preview',
        'image_size_display',
    )

    readonly_fields = (
        'uploaded_at',
        'uploader_display',
        'selected_doctor',
        'image_preview',
        'image_size_display',
        'uploaded_by_type',
    )

    def uploader_display(self, obj):
        """Display the correct uploader (patient or doctor) based on type"""
        if obj.uploaded_by_type == 'patient' and obj.patient:
            return f" {obj.patient.user.username}"
        if obj.uploaded_by_type == 'doctor' and obj.doctor:
            return f" {obj.doctor.user.username}"
        return "Not assigned"
    uploader_display.short_description = "Uploaded by"

    def uploader_name(self, obj):
        """For list view"""
        return self.uploader_display(obj)
    uploader_name.short_description = "Uploader"

    def image_preview(self, obj):
        if not obj.retinal_image:
            return "No image"
        b64 = base64.b64encode(obj.retinal_image).decode()
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:300px;" />',
            b64
        )

    def image_size_display(self, obj):
        size = obj.retinal_image_size
        if not size:
            return "-"
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        return f"{size / (1024 * 1024):.2f} MB"
    image_size_display.short_description = "Image Size"


@admin.register(PredictionResult)
class PredictionResultAdmin(admin.ModelAdmin):

    def retinal_image_preview(self, obj):
        if not obj.retinal_image or not obj.retinal_image.retinal_image:
            return "No image"

        import base64
        from django.utils.html import format_html

        b64 = base64.b64encode(obj.retinal_image.retinal_image).decode("utf-8")
        return format_html(
            '<img src="data:image/jpeg;base64,{}" '
            'style="max-height:300px; border-radius:8px; border:1px solid #ccc;" />',
            b64
        )

    retinal_image_preview.short_description = "Retinal Image Preview"

    fieldsets = (
        ("Retinal Image", {
            "fields": (
                "retinal_image",
                "retinal_image_preview",
            )
        }),
        ("AI Prediction", {
            "fields": (
                "predicted_dr_stage",
                "confidence_score",
                "ai_report",
                "prediction_date",
            )
        }),
    )

    readonly_fields = (
        "retinal_image_preview",
        "prediction_date",
        "retinal_image",
    )

    list_display = (
        "id",
        "retinal_image",
        "prediction_date",
        "confidence_score",
    )


@admin.register(DoctorValidation)
class DoctorValidationAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'doctor',
        'prediction',
        'final_dr_stage',
        'signature_preview',
        'validation_date'
    )

    fields = (
        'prediction',
        'doctor',
        'final_dr_stage',
        'doctor_comments',
        'signature_preview',
        'validation_date',
        'created_at'
    )

    readonly_fields = (
        'prediction',
        'doctor',
        'final_dr_stage',
        'doctor_comments',
        'signature_preview',
        'validation_date',
        'created_at'
    )

    def signature_preview(self, obj):
        if not obj.digital_signature:
            return "No signature"
        return format_html(
            '<span style="font-style:italic; font-size:18px;">{}</span>',
            obj.digital_signature
        )

    signature_preview.short_description = "Digital Signature"

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'receiver_role', 'is_read', 'sent_at')
    list_filter = ('receiver_role', 'is_read')
