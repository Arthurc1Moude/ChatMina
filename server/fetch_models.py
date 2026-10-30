"""Optional: download LoRA adapters from Cloud Storage before startup.

Enable by setting MINA_FETCH_MODELS=1 and providing the GCS prefixes:
  MINA_LUNA_GCS=gs://your-model-bucket/adapters/mina-luna
  MINA_NUMBA_GCS=gs://your-model-bucket/adapters/mina-numba
The Cloud Run service account needs roles/storage.objectViewer on that bucket.
"""
import os
import sys

from google.cloud import storage


def download_prefix(client: storage.Client, gs_prefix: str, destination: str) -> None:
    if not gs_prefix.startswith("gs://"):
        raise ValueError(f"Expected a gs:// URI, got: {gs_prefix}")

    without_scheme = gs_prefix[5:]
    bucket_name, _, prefix = without_scheme.partition("/")
    bucket = client.bucket(bucket_name)

    blobs = list(client.list_blobs(bucket, prefix=prefix))
    if not blobs:
        raise RuntimeError(f"No objects found under {gs_prefix}")

    for blob in blobs:
        relative = blob.name[len(prefix):].lstrip("/")
        if not relative:
            continue
        target_path = os.path.join(destination, relative)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        blob.download_to_filename(target_path)
        print(f"Downloaded {blob.name} -> {target_path}")


def main() -> None:
    if os.getenv("MINA_FETCH_MODELS") != "1":
        return

    client = storage.Client()
    luna_gcs = os.getenv("MINA_LUNA_GCS", "")
    numba_gcs = os.getenv("MINA_NUMBA_GCS", "")

    if luna_gcs:
        download_prefix(client, luna_gcs, os.getenv("MINA_LUNA_ADAPTER", "/models/mina-luna"))
    if numba_gcs:
        download_prefix(client, numba_gcs, os.getenv("MINA_NUMBA_ADAPTER", "/models/mina-numba"))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Model fetch failed: {exc}", file=sys.stderr)
        sys.exit(1)
