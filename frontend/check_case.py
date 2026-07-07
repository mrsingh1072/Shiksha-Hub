import os
import re

src_dir = r"d:\EduVerse-AI\frontend\src"

def get_actual_path(directory, filename):
    try:
        files = os.listdir(directory)
        for f in files:
            if f.lower() == filename.lower():
                return f
    except:
        pass
    return None

def check_imports(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple regex for import ... from '...';
    imports = re.findall(r"import.*?from\s+['""]([^'""]+)['""]", content)
    for imp in imports:
        if imp.startswith('.'):
            # Resolve path
            current_dir = os.path.dirname(file_path)
            parts = imp.split('/')
            target_dir = current_dir
            for p in parts[:-1]:
                if p == '..':
                    target_dir = os.path.dirname(target_dir)
                elif p == '.':
                    pass
                else:
                    actual_dir = get_actual_path(target_dir, p)
                    if actual_dir and actual_dir != p:
                        print(f"CASE MISMATCH: in {file_path}, dir '{p}' should be '{actual_dir}'")
                    if actual_dir:
                        target_dir = os.path.join(target_dir, actual_dir)
                    else:
                        break
            
            target_file_base = parts[-1]
            if target_dir and os.path.exists(target_dir):
                # We need to find if there is a file matching target_file_base with .js, .jsx etc
                found = False
                for f in os.listdir(target_dir):
                    name_without_ext = os.path.splitext(f)[0]
                    if name_without_ext.lower() == target_file_base.lower() or f.lower() == target_file_base.lower():
                        if name_without_ext != target_file_base and f != target_file_base:
                            print(f"CASE MISMATCH: in {file_path}, import '{imp}' should use '{name_without_ext}' (actual file: {f})")
                        found = True
                        break

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".js") or file.endswith(".jsx"):
            check_imports(os.path.join(root, file))
