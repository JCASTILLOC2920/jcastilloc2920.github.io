import os
from PIL import Image

MAX_SIZE_KB = 100
MAX_WIDTH = 1200
EXTENSIONS = {'.jpg', '.jpeg', '.png'}

def optimize_image(filepath):
    try:
        size_kb = os.path.getsize(filepath) / 1024
        if size_kb <= MAX_SIZE_KB:
            print(f"Skipping {filepath} ({size_kb:.2f} KB) - already optimal")
            return

        print(f"Optimizing {filepath} ({size_kb:.2f} KB)...")
        
        with Image.open(filepath) as img:
            # Resize if too wide
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(filepath, optimize=True, quality=85)
            
        new_size_kb = os.path.getsize(filepath) / 1024
        print(f"Finished {filepath}: {size_kb:.2f} KB -> {new_size_kb:.2f} KB")

    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")

def main():
    root_dir = os.getcwd()
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in EXTENSIONS:
                optimize_image(os.path.join(dirpath, filename))

if __name__ == "__main__":
    main()
