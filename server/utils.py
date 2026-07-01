import hashlib

def compute_file_hash(filepath, chunk_size=8192):
    """
    Computes the SHA-256 hash of a file efficiently by reading it in chunks.
    """
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(chunk_size), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def compute_combined_hash(filepaths):
    """
    Computes a single combined SHA-256 hash for multiple files.
    """
    combined_hash = hashlib.sha256()
    for filepath in filepaths:
        combined_hash.update(compute_file_hash(filepath).encode('utf-8'))
    return combined_hash.hexdigest()
