"""Downloader script for Kaggle competition: map-charting-student-math-misunderstandings

Requires Kaggle authentication:
Option 1: Place kaggle.json in ~/.kaggle/kaggle.json
Option 2: Set environment variables:
    $env:KAGGLE_USERNAME = "your_kaggle_username"
    $env:KAGGLE_KEY = "your_kaggle_api_key"
Option 3: Run python -c "import kagglehub; kagglehub.login()" in your terminal.

Note: You must also accept the competition rules on Kaggle:
https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/rules
"""
import os
import shutil
import sys
from pathlib import Path

TARGET_DIR = Path(__file__).parent.resolve()
TOKEN = "KGAT_4bf7d9d25efdc70a35aa1d4378c4bbf0"


def download():
    os.environ["KAGGLE_API_TOKEN"] = TOKEN
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_dir.mkdir(parents=True, exist_ok=True)
    (kaggle_dir / "access_token").write_text(TOKEN, encoding="utf-8")

    try:
        import kagglehub
        import kagglehub.config
        kagglehub.config.set_kaggle_api_token(TOKEN)
    except ImportError:
        print("Installing kagglehub...")
        os.system(f"{sys.executable} -m pip install kagglehub")
        import kagglehub
        import kagglehub.config
        kagglehub.config.set_kaggle_api_token(TOKEN)

    print(f"Downloading competition dataset 'map-charting-student-math-misunderstandings'...")
    try:
        path = kagglehub.competition_download('map-charting-student-math-misunderstandings')
    except Exception as e:
        print("\n[AUTHENTICATION REQUIRED]")
        print("Kaggle returned an error:", e)
        print("\nTo authenticate Kaggle:")
        print("1. Visit https://www.kaggle.com/settings -> Create New Token (downloads kaggle.json)")
        print(f"2. Place kaggle.json in {Path.home() / '.kaggle' / 'kaggle.json'}")
        print("   OR run in terminal: python -c \"import kagglehub; kagglehub.login()\"")
        print("3. Ensure you have accepted competition rules at:")
        print("   https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/rules")
        return False

    print("Cached location:", path)
    src = Path(path)
    copied = []
    for item in src.iterdir():
        dest = TARGET_DIR / item.name
        if item.resolve() == dest.resolve():
            continue
        if item.is_file():
            shutil.copy2(item, dest)
            copied.append(item.name)
        elif item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
            copied.append(item.name)

    print(f"\nSuccessfully downloaded and copied to {TARGET_DIR}:")
    for name in copied:
        print(f" - {name}")
    return True


if __name__ == "__main__":
    download()
