import logging
import sys
from datetime import datetime
from typing import Optional
import os

class Logger:
    """Centralized logging configuration for the LLM Lab API"""
    
    def __init__(self, name: str = "llm_lab", level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup console and file handlers"""
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # File handler (create logs directory if it doesn't exist)
        os.makedirs("logs", exist_ok=True)
        file_handler = logging.FileHandler(f"logs/llm_lab_{datetime.now().strftime('%Y%m%d')}.log")
        file_handler.setLevel(logging.DEBUG)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)
        
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
    
    def info(self, message: str, **kwargs):
        """Log info message"""
        self.logger.info(message, extra=kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message"""
        self.logger.error(message, extra=kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self.logger.warning(message, extra=kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self.logger.debug(message, extra=kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message"""
        self.logger.critical(message, extra=kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log exception with traceback"""
        self.logger.exception(message, extra=kwargs)
    
    def fatal(self, message: str, **kwargs):
        """Log fatal message (alias for critical)"""
        self.logger.critical(message, extra=kwargs)

# Create global logger instance
logger = Logger()

# Convenience functions for backward compatibility
def log_info(message: str, **kwargs):
    logger.info(message, **kwargs)

def log_error(message: str, **kwargs):
    logger.error(message, **kwargs)

def log_warning(message: str, **kwargs):
    logger.warning(message, **kwargs)

def log_debug(message: str, **kwargs):
    logger.debug(message, **kwargs)

def log_critical(message: str, **kwargs):
    logger.critical(message, **kwargs)

def log_exception(message: str, **kwargs):
    logger.exception(message, **kwargs)

def log_fatal(message: str, **kwargs):
    logger.fatal(message, **kwargs)
    