import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logging(log_dir: Path, level: int = logging.INFO) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "bot.log"

    fmt = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    root = logging.getLogger()
    root.setLevel(level)

    # Clear existing handlers (avoid duplicate logs on reload)
    for h in list(root.handlers):
        root.removeHandler(h)

    ch = logging.StreamHandler()
    ch.setLevel(level)
    ch.setFormatter(logging.Formatter(fmt, datefmt=datefmt))

    fh = RotatingFileHandler(log_file, maxBytes=2_000_000, backupCount=5, encoding="utf-8")
    fh.setLevel(level)
    fh.setFormatter(logging.Formatter(fmt, datefmt=datefmt))

    root.addHandler(ch)
    root.addHandler(fh)