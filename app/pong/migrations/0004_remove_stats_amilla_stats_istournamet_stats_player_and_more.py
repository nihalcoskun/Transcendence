# Generated by Django 5.0.3 on 2024-03-17 11:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0003_delete_deneme_stats_amilla'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stats',
            name='amilla',
        ),
        migrations.AddField(
            model_name='stats',
            name='isTournamet',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='stats',
            name='player',
            field=models.JSONField(auto_created=True, default={}),
        ),
        migrations.AddField(
            model_name='stats',
            name='winning_player',
            field=models.CharField(default='furkanhocam', max_length=50),
        ),
    ]
