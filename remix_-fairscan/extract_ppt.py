import zipfile
import xml.etree.ElementTree as ET
import sys
import re

def extract_text_from_pptx(pptx_path, out_path):
    namespaces = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
    text_runs = []
    
    with zipfile.ZipFile(pptx_path, 'r') as slide_zip:
        # Find all slide files
        slide_files = [f for f in slide_zip.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        
        # Sort slide files by number
        slide_files.sort(key=lambda f: int(re.search(r'slide(\d+)\.xml', f).group(1)))
        
        with open(out_path, 'w', encoding='utf-8') as out_f:
            for slide_file in slide_files:
                slide_xml = slide_zip.read(slide_file)
                root = ET.fromstring(slide_xml)
                
                # Extract all text from <a:t> nodes
                out_f.write(f"--- {slide_file} ---\n")
                slide_texts = []
                for node in root.findall('.//a:t', namespaces):
                    if node.text:
                        slide_texts.append(node.text)
                
                out_f.write(" | ".join(slide_texts) + "\n\n")

if __name__ == "__main__":
    pptx_file = "[EXT] Solution Challenge 2026 - Prototype PPT Template - Copy.pptx"
    extract_text_from_pptx(pptx_file, "ppt_slides.txt")
