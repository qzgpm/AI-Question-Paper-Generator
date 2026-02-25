from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100)

class Module(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

class BloomLevel(models.Model):
    name = models.CharField(max_length=50) 
