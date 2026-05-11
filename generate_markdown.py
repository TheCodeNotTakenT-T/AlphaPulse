import os

def generate_markdown(repo_path, output_file):
    excluded_dirs = {'.git', 'node_modules', 'dist', 'build', '.vscode', 'public', 'assets'}
    excluded_files = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store'}
    allowed_extensions = {'.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md'}

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# AlphaPulse Codebase\n\n")
        
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            
            for file in files:
                if file in excluded_files:
                    continue
                
                ext = os.path.splitext(file)[1]
                if ext not in allowed_extensions and ext != '':
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, repo_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as code_file:
                        content = code_file.read()
                        
                    f.write(f"## {rel_path}\n\n")
                    f.write(f"```{ext[1:] if ext else 'text'}\n")
                    f.write(content)
                    f.write("\n```\n\n")
                except Exception as e:
                    f.write(f"## {rel_path}\n\n")
                    f.write(f"> Error reading file: {e}\n\n")

if __name__ == '__main__':
    repo_path = '.'
    output_file = 'alphapulse_codebase.md'
    generate_markdown(repo_path, output_file)
    print(f"Codebase exported to {output_file}")
