"""
Find OpenAI client usage that might have proxies parameter
"""

import os
import re
from pathlib import Path

def find_openai_usage():
    """Find OpenAI client instantiations"""
    
    project_root = Path(__file__).parent.parent
    
    # Only search in src directory
    src_files = list(Path(project_root / 'src').glob('*.py'))
    
    results = []
    
    for file_path in src_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    # Look for OpenAI client initialization
                    if re.search(r'OpenAI\s*\(', line, re.IGNORECASE):
                        results.append({
                            'file': str(file_path.relative_to(project_root)),
                            'line': i,
                            'content': line.strip()
                        })
                    # Look for any Client with proxies
                    elif 'proxies' in line.lower() and ('client' in line.lower() or '=' in line):
                        results.append({
                            'file': str(file_path.relative_to(project_root)),
                            'line': i,
                            'content': line.strip()
                        })
        except Exception as e:
            continue
    
    return results

if __name__ == "__main__":
    print("🔍 Searching for OpenAI client usage...")
    results = find_openai_usage()
    
    if results:
        print("\n❌ Found potential issues:")
        for result in results:
            print(f"  📁 {result['file']}:{result['line']}")
            print(f"     {result['content']}")
    else:
        print("✅ No OpenAI client issues found in src/ directory")