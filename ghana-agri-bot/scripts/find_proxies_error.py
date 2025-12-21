"""
Find the exact location of the proxies parameter error
"""

import os
import re
from pathlib import Path

def find_proxies_usage():
    """Find all instances of 'proxies' parameter in the codebase"""
    
    project_root = Path(__file__).parent.parent
    
    # Search in all Python files
    python_files = list(project_root.glob('**/*.py'))
    
    results = []
    
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    if 'proxies' in line.lower() and ('=' in line or 'Client' in line):
                        results.append({
                            'file': str(file_path.relative_to(project_root)),
                            'line': i,
                            'content': line.strip()
                        })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return results

def find_client_usage():
    """Find all Client class instantiations"""
    
    project_root = Path(__file__).parent.parent
    python_files = list(project_root.glob('**/*.py'))
    
    results = []
    
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    if re.search(r'\b\w*Client\s*\(', line):
                        results.append({
                            'file': str(file_path.relative_to(project_root)),
                            'line': i,
                            'content': line.strip()
                        })
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    return results

if __name__ == "__main__":
    print("🔍 Searching for 'proxies' parameter usage...")
    proxies_results = find_proxies_usage()
    
    if proxies_results:
        print("\n❌ Found 'proxies' usage:")
        for result in proxies_results:
            print(f"  📁 {result['file']}:{result['line']}")
            print(f"     {result['content']}")
    else:
        print("✅ No 'proxies' parameter found")
    
    print("\n🔍 Searching for Client instantiations...")
    client_results = find_client_usage()
    
    if client_results:
        print("\n📋 Found Client usage:")
        for result in client_results:
            print(f"  📁 {result['file']}:{result['line']}")
            print(f"     {result['content']}")
    else:
        print("✅ No Client instantiations found")