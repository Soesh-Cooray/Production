from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils.translation import gettext as _
from djoser.email import PasswordResetEmail, PasswordChangedConfirmationEmail


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = "registration/password_reset_email.html"
    text_template_name = "registration/password_reset_email.txt"

    def get_context_data(self):
        context = super().get_context_data()
        
        user = context.get("user")
        if user:
            context["uid"] = urlsafe_base64_encode(force_bytes(user.pk))
            context["token"] = default_token_generator.make_token(user)
            
        
        try:
            site = get_current_site(self.request)
            context["site_name"] = site.name
            context["domain"] = site.domain
        except:
            context["site_name"] = "BudgetMaster"
            context["domain"] = "localhost:3000"
            
        context["protocol"] = "https" if self.request.is_secure() else "http"
        
        return context

    def send(self, to, *args, **kwargs):
        self.to = to
        self.cc = kwargs.pop("cc", [])
        self.bcc = kwargs.pop("bcc", [])
        self.reply_to = kwargs.pop("reply_to", [])
        self.from_email = kwargs.pop("from_email", None)
        
        self.render()
        
        msg = EmailMultiAlternatives(
            subject=self.subject,
            body=self.text_body,
            from_email=self.from_email,
            to=self.to,
            cc=self.cc,
            bcc=self.bcc,
            reply_to=self.reply_to,
        )
        
        if self.html_body:
            msg.attach_alternative(self.html_body, "text/html")
        
        msg.send()

    def render(self):
        context = self.get_context_data()
        self.subject = _("Password Reset - BudgetMaster")
        self.html_body = render_to_string(self.template_name, context)
        self.text_body = render_to_string(self.text_template_name, context)


class CustomPasswordChangedEmail(PasswordChangedConfirmationEmail):
    template_name = "registration/password_changed_email.html"
    text_template_name = "registration/password_changed_email.txt"

    def get_context_data(self):
        context = super().get_context_data()
        
        
        try:
            site = get_current_site(self.request)
            context["site_name"] = site.name
            context["domain"] = site.domain
        except:
            context["site_name"] = "BudgetMaster"
            context["domain"] = "localhost:3000"
            
        context["protocol"] = "https" if self.request.is_secure() else "http"
        return context

    def send(self, to, *args, **kwargs):
        self.to = to
        self.cc = kwargs.pop("cc", [])
        self.bcc = kwargs.pop("bcc", [])
        self.reply_to = kwargs.pop("reply_to", [])
        self.from_email = kwargs.pop("from_email", None)
        
        self.render()
        
        msg = EmailMultiAlternatives(
            subject=self.subject,
            body=self.text_body,
            from_email=self.from_email,
            to=self.to,
            cc=self.cc,
            bcc=self.bcc,
            reply_to=self.reply_to,
        )
        
        if self.html_body:
            msg.attach_alternative(self.html_body, "text/html")
        
        msg.send()

    def render(self):
        context = self.get_context_data()
        self.subject = _("Password Changed - BudgetMaster")
        self.html_body = render_to_string(self.template_name, context)
        self.text_body = render_to_string(self.text_template_name, context) 