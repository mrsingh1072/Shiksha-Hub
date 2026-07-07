import os
import glob

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False

    original = content
    
    # Do longest replacements first
    content = content.replace("Shiksha Hub", "Shiksha Hub")
    content = content.replace("Shiksha-Hub", "Shiksha-Hub")
    content = content.replace("shiksha-hub", "shiksha-hub")
    content = content.replace("Shiksha Hub", "Shiksha Hub")
    content = content.replace("shiksha-hub", "shiksha-hub")

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
        return True
    return False

def main():
    root_dir = r"d:\Shiksha-Hub"
    extensions = ["*.jsx", "*.js", "*.html", "*.py", "*.json", "*.md", "*.css", "*.txt"]
    
    updated_count = 0
    for ext in extensions:
        pattern = os.path.join(root_dir, "**", ext)
        for filepath in glob.glob(pattern, recursive=True):
            if "node_modules" in filepath or ".git" in filepath or "venv" in filepath or "__pycache__" in filepath or "dist" in filepath:
                continue
            if replace_in_file(filepath):
                updated_count += 1
                
    print(f"Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
