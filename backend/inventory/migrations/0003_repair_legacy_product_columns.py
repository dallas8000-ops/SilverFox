"""Add Product columns missing on Railway Postgres after --fake-initial on legacy tables."""

from django.db import migrations


def _existing_columns(schema_editor, table):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        if connection.vendor == 'postgresql':
            cursor.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = CURRENT_SCHEMA()
                  AND table_name = %s
                """,
                [table],
            )
            return {row[0] for row in cursor.fetchall()}
        if connection.vendor == 'sqlite':
            cursor.execute(f'PRAGMA table_info("{table}")')
            return {row[1] for row in cursor.fetchall()}
    return set()


def repair_product_columns(apps, schema_editor):
    table = 'inventory_product'
    existing = _existing_columns(schema_editor, table)
    if not existing:
        return

    vendor = schema_editor.connection.vendor
    additions = [
        ('static_image', "varchar(255) NOT NULL DEFAULT ''"),
        ('image_verified', 'boolean NOT NULL DEFAULT false'),
        ('price_eur', 'numeric(10, 2) NOT NULL DEFAULT 0'),
        ('price_kes', 'numeric(12, 2) NOT NULL DEFAULT 0'),
    ]
    if vendor == 'sqlite':
        additions = [
            ('static_image', "varchar(255) NOT NULL DEFAULT ''"),
            ('image_verified', 'bool NOT NULL DEFAULT 0'),
            ('price_eur', 'decimal NOT NULL DEFAULT 0'),
            ('price_kes', 'decimal NOT NULL DEFAULT 0'),
        ]

    with schema_editor.connection.cursor() as cursor:
        for name, ddl in additions:
            if name in existing:
                continue
            if vendor == 'postgresql':
                cursor.execute(
                    f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {name} {ddl}'
                )
            else:
                cursor.execute(f'ALTER TABLE {table} ADD COLUMN {name} {ddl}')


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0002_alter_product_options_product_image_verified_and_more'),
    ]

    operations = [
        migrations.RunPython(repair_product_columns, migrations.RunPython.noop),
    ]
