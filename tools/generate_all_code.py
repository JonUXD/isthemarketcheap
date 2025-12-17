import os
import json
from datetime import datetime
import time

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))        # cv-jonugarte/tools/
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..")) # cv-jonugarte/
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "tools")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "output_all_code.txt")
CONFIG_FILE = os.path.join(SCRIPT_DIR, "config.json")

# Load config
with open(CONFIG_FILE, "r") as f:
    config = json.load(f)

INCLUDE_EXTENSIONS = config.get("include_extensions", [])
EXCLUDE_FOLDERS = set(config.get("exclude_folders", []))
EXCLUDE_FILES = set(config.get("exclude_files", []))

# Ensure output folder exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def is_text_file(file_path):
    """Check if the file extension is included."""
    _, ext = os.path.splitext(file_path)
    return ext.lower() in INCLUDE_EXTENSIONS

def should_skip(file_path):
    """Check if file or folder should be skipped."""
    if os.path.basename(file_path) in EXCLUDE_FILES:
        return True
    for part in file_path.split(os.sep):
        if part in EXCLUDE_FOLDERS:
            return True
    return False

def collect_files_text(root_path):
    all_texts = []
    file_stats = []  # Store file name and number of characters
    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_FOLDERS]
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            if should_skip(file_path):
                continue
            if is_text_file(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                    all_texts.append(f"--- {rel_path} ---\n{content}\n")
                    file_stats.append((rel_path, len(content)))
                except Exception as e:
                    print(f"Warning: Could not read {file_path}: {e}")
    return all_texts, file_stats

def generate_directory_tree(root_path, max_depth=3):
    """Generate a directory tree structure up to max_depth levels."""
    tree_lines = []
    
    def build_tree(current_path, prefix="", depth=0):
        if depth > max_depth:
            return
            
        # Get all items in current directory
        try:
            items = os.listdir(current_path)
        except PermissionError:
            return
            
        # Filter out excluded folders and files
        items = [item for item in items if item not in EXCLUDE_FOLDERS and item not in EXCLUDE_FILES]
        
        # Separate directories and files
        dirs = []
        files = []
        for item in items:
            item_path = os.path.join(current_path, item)
            if os.path.isdir(item_path):
                dirs.append(item)
            else:
                # Only include files with allowed extensions
                if is_text_file(item_path) and not should_skip(item_path):
                    files.append(item)
        
        # Sort alphabetically
        dirs.sort()
        files.sort()
        
        # Add directories to tree
        for i, dir_name in enumerate(dirs):
            dir_path = os.path.join(current_path, dir_name)
            is_last_dir = (i == len(dirs) - 1 and len(files) == 0)
            connector = "└── " if is_last_dir else "├── "
            tree_lines.append(f"{prefix}{connector}{dir_name}/")
            
            new_prefix = prefix + ("    " if is_last_dir else "│   ")
            build_tree(dir_path, new_prefix, depth + 1)
        
        # Add files to tree
        for i, file_name in enumerate(files):
            is_last = (i == len(files) - 1)
            connector = "└── " if is_last else "├── "
            tree_lines.append(f"{prefix}{connector}{file_name}")
    
    # Start building from project root
    tree_lines.append(os.path.basename(root_path) + "/")
    build_tree(root_path)
    
    return tree_lines

def main():
    print("Collecting text files...")
    texts, file_stats = collect_files_text(PROJECT_ROOT)
    print(f"Collected {len(texts)} files.")

    # Generate directory tree
    print("Generating directory structure...")
    tree_lines = generate_directory_tree(PROJECT_ROOT)
    
    # Write all code to output file
    print(f"Writing output to {OUTPUT_FILE} ...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(texts))
        
        # Add metadata section
        f.write("\n" + "="*80 + "\n")
        f.write("METADATA\n")
        f.write("="*80 + "\n\n")
        
        # File statistics
        f.write(f"Files Parsed: {len(texts)}\n")
        f.write(f"Total Characters: {sum(stat[1] for stat in file_stats)}\n\n")
        
        # File list with character counts
        f.write("File List:\n")
        f.write("-" * 40 + "\n")
        for file_path, char_count in sorted(file_stats):
            f.write(f"{file_path}: {char_count} characters\n")
        
        # Directory structure
        f.write("\nDirectory Structure:\n")
        f.write("-" * 40 + "\n")
        for line in tree_lines:
            f.write(line + "\n")
        
        # Timestamps
        local_time = datetime.now()
        utc_time = datetime.utcnow()
        f.write(f"\nGenerated at:\n")
        f.write(f"Local: {local_time.strftime('%Y-%m-%d %H:%M:%S %Z')}\n")
        f.write(f"UTC:   {utc_time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        f.write(f"Timestamp: {int(time.time())}\n")
    
    print("Done!")

    # Print file sizes in characters
    print("\nFile Character Counts:")
    for file, char_count in file_stats:
        print(f"{file}: {char_count} characters")
    
    # Print directory structure to console
    print("\nDirectory Structure:")
    print("-" * 40)
    for line in tree_lines:
        print(line)

if __name__ == "__main__":
    main()