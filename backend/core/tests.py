import os
from pathlib import Path

from django.test import Client, TestCase


class SilverFoxSmokeTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health(self):
        res = self.client.get('/health/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['service'], 'silverfox')

    def test_shop_page(self):
        res = self.client.get('/shop/')
        self.assertEqual(res.status_code, 200)

    def test_home_redirects_to_shop(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 302)
        self.assertIn('/shop/', res.url)
