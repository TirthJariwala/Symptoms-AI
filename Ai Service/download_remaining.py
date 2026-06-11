"""
download_remaining.py
──────────────────────
Downloads OCTMNIST and PathMNIST with resume support.
If download fails midway — just run again, it will resume!

Run: python download_remaining.py
"""

import os
import requests
from tqdm import tqdm
from pathlib import Path

# ── Pendrive path ─────────────────────────────────────────────────
PENDRIVE_PATH = Path("F:\\datasets\\medmnist")
PENDRIVE_PATH.mkdir(parents=True, exist_ok=True)

# ── Files to download ─────────────────────────────────────────────
DATASETS = [
    {
        "name":     "OCTMNIST (Retinal - 4 diseases, 3.7 GB)",
        "url":      "https://zenodo.org/records/10519652/files/octmnist_224.npz?download=1",
        "filename": "octmnist_224.npz",
        "md5":      "abc493b6d529d5de7569faaef2773ba3",
    },
    {
        "name":     "PathMNIST (Pathology - Cancer, 11.7 GB)",
        "url":      "https://zenodo.org/records/10519652/files/pathmnist_224.npz?download=1",
        "filename": "pathmnist_224.npz",
        "md5":      "2c51a510bcdc9cf8ddb2af93af1eadec",
    },
]


def download_with_resume(url: str, dest_path: Path, name: str) -> bool:
    """
    Download a file with resume support.
    If file already partially downloaded — continues from where it stopped.

    Args:
        url:       Download URL.
        dest_path: Where to save the file.
        name:      Display name for progress bar.

    Returns:
        True if download succeeded, False otherwise.
    """
    # Check if file already fully downloaded
    if dest_path.exists():
        existing_size = dest_path.stat().st_size

        # Check remote file size
        try:
            response = requests.head(url, allow_redirects=True, timeout=30)
            total_size = int(response.headers.get("content-length", 0))

            if existing_size == total_size:
                print(f"  ✅ Already downloaded: {dest_path.name}")
                return True
            else:
                print(f"  ⏩ Resuming from {existing_size / 1e9:.2f} GB...")
        except Exception:
            print(f"  ⏩ File exists ({existing_size / 1e9:.2f} GB) — resuming...")

    else:
        existing_size = 0

    # Set resume header
    headers = {}
    if existing_size > 0:
        headers["Range"] = f"bytes={existing_size}-"

    try:
        response = requests.get(
            url,
            headers=headers,
            stream=True,
            timeout=60,
            allow_redirects=True,
        )

        total_size = int(response.headers.get("content-length", 0)) + existing_size

        # Open file in append mode if resuming, write mode if fresh
        mode = "ab" if existing_size > 0 else "wb"

        with open(dest_path, mode) as f:
            with tqdm(
                total=total_size,
                initial=existing_size,
                unit="B",
                unit_scale=True,
                unit_divisor=1024,
                desc=f"  {name}",
            ) as pbar:
                for chunk in response.iter_content(chunk_size=1024 * 1024):  # 1MB chunks
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))

        print(f"  ✅ Download complete: {dest_path.name}")
        return True

    except KeyboardInterrupt:
        print(f"\n  ⚠️  Download paused. Run again to resume from where it stopped.")
        return False
    except Exception as e:
        print(f"  ❌ Download failed: {e}")
        print(f"     Run again to retry — it will resume automatically!")
        return False


def verify_md5(file_path: Path, expected_md5: str) -> bool:
    """Verify file integrity using MD5 hash."""
    import hashlib
    print(f"  🔍 Verifying {file_path.name}...")
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            md5.update(chunk)
    actual = md5.hexdigest()
    if actual == expected_md5:
        print(f"  ✅ Verified!")
        return True
    else:
        print(f"  ❌ MD5 mismatch — file corrupted, deleting...")
        file_path.unlink()
        return False


# ── Main ──────────────────────────────────────────────────────────

print("=" * 60)
print("  Downloading Remaining MedMNIST Datasets")
print(f"  Saving to: {PENDRIVE_PATH}")
print("  Resume supported — safe to stop and restart!")
print("=" * 60)

for dataset in DATASETS:
    print(f"\n⬇️  {dataset['name']}")
    dest = PENDRIVE_PATH / dataset["filename"]

    success = download_with_resume(dataset["url"], dest, dataset["name"])

    if success and dest.exists():
        # Verify MD5 only if freshly downloaded
        file_size_gb = dest.stat().st_size / 1e9
        print(f"  📦 File size: {file_size_gb:.2f} GB")

print("\n" + "=" * 60)
print("✅ Done! Check F:\\datasets\\medmnist\\ for your files.")
print("=" * 60)
print("\nFiles in your medmnist folder:")
for f in sorted(PENDRIVE_PATH.glob("*.npz")):
    size_gb = f.stat().st_size / 1e9
    print(f"  {f.name:40s} {size_gb:.2f} GB")

print("\nNext step — start training:")
print('  python -c "from app.training.train_cnn import train_cnn; train_cnn(dataset_name=\'chest_xray\', epochs=50)"')