import json, re

with open('extracted_topics.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

result = {}
for filename, text in data.items():
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    try:
        start_idx = lines.index("TOPLAM") + 1
    except ValueError:
        continue
    
    areas = []
    current_area = None
    
    i = start_idx
    while i < len(lines):
        line = lines[i]
        
        # Skip headers
        if line in ["ÜNİTE VE KONULARA GÖRE SORU DAĞILIM TABLOSU", "SAYFA", "NO", "ÜNİTE", "KONU", "TOPLAM"] or re.match(r'^20\d\d$', line):
            i += 1
            continue
            
        # Is it a page number? (Page numbers are 2 or 3 digits, like 78, 120. They are never single digits. Wait, page 9?)
        # Let's assume page numbers are always >= 10 in these books, or if they are 1-9 they might conflict with 'TOPLAM'.
        # Actually, in the output, data lines are usually single digits (1, 2, 3) or '-'.
        if re.match(r'^\d{2,3}$', line):
            page_no = line
            i += 1
            if i >= len(lines): break
            unite = lines[i]
            i += 1
            if i >= len(lines): break
            konu = lines[i]
            i += 1
            
            current_area = {"name": unite, "topics": []}
            areas.append(current_area)
            current_area["topics"].append({"name": konu})
            
        elif re.match(r'^[\d\-]{1,2}$', line) and line != '-':
            # Stray data line? Wait, if it's '-' or single digit, skip
            i += 1
        elif line == '-':
            i += 1
        else:
            # It's a new KONU under the same ÜNİTE
            konu = line
            i += 1
            if current_area:
                current_area["topics"].append({"name": konu})

    result[filename] = areas

with open('parsed_topics.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Parsed successfully!")
