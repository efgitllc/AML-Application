"""
Script to fix all __init__.py files in the project
"""
import os

def fix_init_files():
    # Get all directories in the current directory
    dirs = [d for d in os.listdir('.') if os.path.isdir(d)]
    
    # Process each directory
    for dir_name in dirs:
        init_file = os.path.join(dir_name, '__init__.py')
        
        # Delete if exists
        if os.path.exists(init_file):
            os.remove(init_file)
        
        # Create new file
        with open(init_file, 'w', encoding='utf-8') as f:
            f.write('"""\\n{} app initialization\\n"""'.format(dir_name.replace('_', ' ').title()))

if __name__ == '__main__':
    fix_init_files() 