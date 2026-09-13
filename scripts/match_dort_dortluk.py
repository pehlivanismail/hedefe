import csv
import re
import unicodedata

def slugify(text):
    text = text.lower()
    text = text.replace('ı', 'i').replace('ö', 'o').replace('ü', 'u').replace('ş', 's').replace('ğ', 'g').replace('ç', 'c')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

dort_dortluk_ids = set()
with open('/Users/ismailpehlivan/Documents/hedefe.net/dort-dortluk.csv', 'r') as f:
    for line in f:
        line = line.strip()
        if line and line != 'Konu ID':
            dort_dortluk_ids.add(line)

rows = []
header = []
with open('/Users/ismailpehlivan/Desktop/yks-konular.csv', 'r') as f:
    reader = csv.reader(f)
    header = next(reader)
    # If the file already has 'Konu ID', handle it or remove the old run's result
    if header[-1] != 'Konu ID':
        header.append('Konu ID')
    
    for row in reader:
        # Ignore the old Konu ID if we are re-running
        if len(row) > len(header) - 1:
            row = row[:len(header) - 1]
            
        sinav = row[0]
        ders = row[1]
        alan = row[2]
        konu = row[3]
        
        # We want to collect ALL matching IDs (both AYT and TYT if they exist)
        matched_ids = set()
        
        combinations = [
            f"{sinav}-{ders}-{alan}-dort-dortluk-tarama",
            f"{sinav}-{ders}-{konu}-dort-dortluk-tarama",
            f"ayt-{ders}-{alan}-dort-dortluk-tarama",
            f"ayt-{ders}-{konu}-dort-dortluk-tarama",
            f"tyt-{ders}-{alan}-dort-dortluk-tarama",
            f"tyt-{ders}-{konu}-dort-dortluk-tarama",
        ]
        
        for combo in combinations:
            slug = slugify(combo)
            slug = slug.replace("ikinci-dereceden", "ii-dereceden")
            slug = slug.replace("birinci-dereceden", "i-dereceden")
            
            if slug in dort_dortluk_ids:
                matched_ids.add(slug)
        
        if not matched_ids:
            # Fallback: Check if alan or konu slug is inside the ID
            alan_slug = slugify(alan)
            konu_slug = slugify(konu)
            ders_slug = slugify(ders)
            for d_id in dort_dortluk_ids:
                if f"-{ders_slug}-" in d_id and (f"-{alan_slug}-" in d_id or f"-{konu_slug}-" in d_id):
                    matched_ids.add(d_id)
        
        row.append(",".join(sorted(list(matched_ids))))
        rows.append(row)

with open('/Users/ismailpehlivan/Desktop/yks-konular-matched.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(rows)

print("Matched rows:", sum(1 for r in rows if r[-1] != ""))
print("Total rows:", len(rows))
