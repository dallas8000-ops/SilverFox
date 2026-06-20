from django.db import models


class ContactInquiry(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=160, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Contact inquiries'

    def __str__(self):
        return f'{self.name} - {self.subject or "Inquiry"}'
