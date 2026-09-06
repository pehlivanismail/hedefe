import sys, os, json
import fitz # PyMuPDF

dir_path = 'cikmis_sorular'
files = [f for f in os.listdir(dir_path) if f.endswith('.pdf')]
output = {}

for f in files:
    doc = fitz.open(os.path.join(dir_path, f))
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    output[f] = text

with open('extracted_topics.json', 'w', encoding='utf-8') as outfile:
    json.dump(output, outfile, ensure_ascii=False, indent=2)
print("Done")
