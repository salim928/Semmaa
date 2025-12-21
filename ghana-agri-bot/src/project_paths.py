from pathlib import Path
import os

def project_root() -> Path:
    return Path(__file__).resolve().parents[1]

def data_dir() -> Path:
    return project_root() / "data"

def chroma_dir() -> Path:
    env = os.getenv("CHROMA_DIR")
    return Path(env) if env else data_dir() / "processed" / "chroma_db"