# accounts/admin.py
from django.utils import timezone
from django.contrib import admin
from django.utils.html import format_html
from .models import User, DoctorVerification
import base64


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'username',
        'email',
        'role',
        'date_joined',
        'doctor_verification_status',   # NEW: shows verification status with color
        'license_preview_small'
    )
    list_filter = ('role', 'date_joined')
    search_fields = ('username', 'email')
    readonly_fields = ('license_preview_full', 'license_size')
    fields = (
        'username', 'email', 'role', 'gender', 'date_of_birth', 'specialization',
        'license_preview_full', 'license_size',
    )

    def license_size(self, obj):
        if obj.license_image:
            return f"{len(obj.license_image):,} bytes"
        return "No image"
    license_size.short_description = "Stored Size"

    def license_preview_small(self, obj):
        if obj.role != 'doctor' or not obj.license_image or len(obj.license_image) == 0:
            return "-"
        try:
            b64 = base64.b64encode(obj.license_image).decode('utf-8')
            return format_html(
                '<img src="data:image/jpeg;base64,{}" style="max-height: 60px; border-radius: 4px;"/>',
                b64[:12000]
            )
        except Exception:
            return "Error"
    license_preview_small.short_description = "License"

    def license_preview_full(self, obj):
        if obj.role != 'doctor' or not obj.license_image or len(obj.license_image) == 0:
            return "Not applicable (not a doctor)"
        try:
            b64 = base64.b64encode(obj.license_image).decode('utf-8')
            return format_html(
                '<div style="text-align: center;">'
                '<img src="data:image/jpeg;base64,{}" style="max-width: 100%; max-height: 600px; border: 1px solid #ddd; border-radius: 8px;"/>'
                '</div>',
                b64
            )
        except Exception as e:
            return f"Error displaying image: {str(e)}"
    license_preview_full.short_description = "Full License Preview"

    # NEW: Show verification status in Users list
    def doctor_verification_status(self, obj):
        if obj.role != 'doctor':
            return "-"
        try:
            verification = obj.doctor_verification
            colors = {
                'pending': 'orange',
                'verified': 'green',
                'rejected': 'red',
            }
            color = colors.get(verification.status, 'gray')
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, verification.get_status_display()
            )
        except DoctorVerification.DoesNotExist:
            return "No verification record"
    doctor_verification_status.short_description = "Verification Status"
    doctor_verification_status.admin_order_field = 'doctor_verification__status'  # sortable


@admin.register(DoctorVerification)
class DoctorVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'applied_at',
        'status',               # editable dropdown
        'status_display',       # colored text
        'verified_by',
        'verified_at',          # this should now show after approve/reject
        'reason_short',
        'license_preview_small',
    )
    list_filter = ('status', 'applied_at')
    search_fields = ('user__username', 'user__email', 'reason')
    readonly_fields = ('applied_at', 'user', 'verified_at', 'license_preview_full')
    list_editable = ('status',)
    actions = ['approve_selected', 'reject_selected']
    fields = (
        'user',
        'applied_at',
        'status',
        'verified_by',
        'verified_at',
        'reason',
        'license_preview_full',
    )

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'verified': 'green',
            'rejected': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = "Status"

    def reason_short(self, obj):
        return obj.reason[:60] + "..." if obj.reason else "-"
    reason_short.short_description = "Reason / Notes"

    def license_preview_small(self, obj):
        if not obj.user.license_image or len(obj.user.license_image) == 0:
            return "No image"
        try:
            b64 = base64.b64encode(obj.user.license_image).decode('utf-8')
            return format_html(
                '<img src="data:image/jpeg;base64,{}" style="max-height: 60px; border-radius: 4px;"/>',
                b64[:12000]
            )
        except Exception:
            return "Error"
    license_preview_small.short_description = "License"

    def license_preview_full(self, obj):
        if not obj.user.license_image or len(obj.user.license_image) == 0:
            return "No license image"
        try:
            b64 = base64.b64encode(obj.user.license_image).decode('utf-8')
            return format_html(
                '<div style="text-align: center;">'
                '<img src="data:image/jpeg;base64,{}" style="max-width: 100%; max-height: 600px;"/>'
                '</div>',
                b64
            )
        except Exception as e:
            return f"Error: {str(e)}"
    license_preview_full.short_description = "Full Preview"

    def approve_selected(self, request, queryset):
        for obj in queryset:
            obj.approve(request.user)
        self.message_user(request, "Selected doctors approved.")
    approve_selected.short_description = "Approve selected"

    def reject_selected(self, request, queryset):
        for obj in queryset:
            obj.reject(request.user, reason="Rejected by admin")
        self.message_user(request, "Selected doctors rejected.")
    reject_selected.short_description = "Reject selected"

    def save_model(self, request, obj, form, change):
            if change and 'status' in form.changed_data:
                if obj.status == 'verified':
                    obj.verified_by = request.user
                    obj.verified_at = timezone.now()
                elif obj.status == 'rejected':
                    obj.verified_by = request.user
                    obj.verified_at = timezone.now()
                    if not obj.reason:
                        obj.reason = "Rejected via inline edit"
            super().save_model(request, obj, form, change)
