# Generated by Django 2.0.6 on 2018-06-17 01:43

from django.db import migrations, models
import django.db.models.deletion
import re


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.TextField(unique=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('title', models.TextField()),
                ('year', models.IntegerField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Artist',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.TextField(unique=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('title', models.TextField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SystemProperty',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('modified', models.DateTimeField(auto_now=True)),
                ('key', models.TextField(unique=True)),
                ('value_type', models.CharField(choices=[('STRING', 'STRING'), ('INTEGER', 'INTEGER')], max_length=100)),
                ('string_value', models.TextField(null=True)),
                ('integer_value', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.TextField(unique=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('title', models.TextField()),
                ('valid', models.BooleanField(default=True)),
                ('file_mod_time', models.DateTimeField()),
                ('last_synced', models.DateTimeField()),
                ('path', models.FilePathField(match=re.compile('.*\\.mp3$'), path='/Users/lanny/Music/iTunes/iTunes Media/Music', unique=True)),
                ('track_num', models.PositiveIntegerField(null=True)),
                ('album', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ampersand.Album')),
                ('artist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ampersand.Artist')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='album',
            name='artist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ampersand.Artist'),
        ),
        migrations.AlterUniqueTogether(
            name='album',
            unique_together={('artist', 'title')},
        ),
    ]
