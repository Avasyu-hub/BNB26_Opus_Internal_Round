"""Dataset Unpacker & Inspector for Kaggle Competition: map-charting-student-math-misunderstandings.

Automatically detects, extracts, and inspects any downloaded ZIP file in this folder:
relearn/kaggledata/
"""
import os
import zipfile
from pathlib import Path

DATA_DIR = Path(__file__).parent.resolve()


def unpack_and_inspect():
    print(f"Scanning for dataset archives in: {DATA_DIR}")
    zip_files = list(DATA_DIR.glob("*.zip"))

    if not zip_files:
        csv_files = list(DATA_DIR.glob("*.csv"))
        if csv_files:
            print(f"Found {len(csv_files)} extracted CSV files already in folder:")
            for f in csv_files:
                print(f"  - {f.name} ({f.stat().st_size / 1024:.1f} KB)")
            inspect_csv_files(csv_files)
            return

        print("\nNo .zip files found in relearn/kaggledata yet.")
        print("Please download the dataset from:")
        print("https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/data")
        print(f"and place the zip file in:\n{DATA_DIR}\n")
        print("Then run this script again: python relearn/kaggledata/unpack_dataset.py")
        return

    for zf in zip_files:
        print(f"\nExtracting archive: {zf.name} ({zf.stat().st_size / (1024*1024):.2f} MB)...")
        with zipfile.ZipFile(zf, "r") as z:
            z.extractall(DATA_DIR)
            print(f"Extracted {len(z.namelist())} files successfully.")

    # Inspect resulting files
    csv_files = list(DATA_DIR.glob("*.csv"))
    inspect_csv_files(csv_files)


def inspect_csv_files(csv_files):
    if not csv_files:
        return

    print("\nDataset Summary & Schema:")
    for f in csv_files:
        line_count = sum(1 for _ in open(f, encoding="utf-8", errors="ignore"))
        print(f"\n[{f.name}] — {line_count:,} rows")
        with open(f, encoding="utf-8", errors="ignore") as fp:
            header = fp.readline().strip()
            print(f"Columns: {header}")
            sample = fp.readline().strip()
            if sample:
                print(f"Sample row: {sample[:150]}...")


if __name__ == "__main__":
    unpack_and_inspect()
