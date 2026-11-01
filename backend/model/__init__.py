"""
Customer Segmentation ML Service
Package initialization for model services.
"""
from .segmentation import CustomerSegmentationModel, get_model_service

__all__ = ["CustomerSegmentationModel", "get_model_service"]
