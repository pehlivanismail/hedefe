import os
import glob
import csv
import json

def get_category_and_name(sinav_yolu):
    # e.g. mebi/TYT/tyt-10.pdf
    # e.g. 3adim/AYT/ayt-say-1-1.pdf
    parts = sinav_yolu.replace(".pdf", "").split("/")
    if len(parts) < 3:
        return "Diğer Denemeler", "Deneme", "TYT"
        
    source = parts[0]
    exam_type = parts[1].upper() # TYT or AYT
    filename = parts[-1]
    
    category = "Diğer Denemeler"
    if source == "mebi":
        category = f"MEBİ {exam_type} Denemeleri"
    elif source == "3adim":
        category = f"3 Adım {exam_type} Denemeleri"
        
    name = filename
    if source == "mebi":
        # tyt-10 -> Deneme 10
        # ayt-say-15 -> Deneme 15
        if "-" in filename:
            name = f"Deneme {filename.split('-')[-1]}"
    elif source == "3adim":
        # ayt-say-1-2 -> 1. Adım 2. Deneme
        # tyt-1-2 -> 1. Adım 2. Deneme
        tokens = filename.split('-')
        if len(tokens) >= 2:
            step = tokens[-2]
            num = tokens[-1]
            name = f"{step}. Adım {num}. Deneme"
            
    return category, name, exam_type

def main():
    csv_files = glob.glob("docs/Sinavlar/**/*-konu-eslestirmesi.csv", recursive=True)
    
    templates = []
    
    for fpath in sorted(csv_files):
        filename_without_ext = os.path.basename(fpath).replace("-konu-eslestirmesi.csv", "")
        template_id = filename_without_ext
        
        questions = []
        category = ""
        name = ""
        exam_type = ""
        
        with open(fpath, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader, None)
            
            for row in reader:
                if len(row) < 7: continue
                # Sinav Yolu,Ders,Soru No,Alan,Konu,AlanID,KonuID
                sinav_yolu = row[0]
                ders = row[1]
                soru_no = row[2]
                alan = row[3]
                konu = row[4]
                alan_id = row[5]
                konu_id = row[6]
                
                cat, nm, etype = get_category_and_name(sinav_yolu)
                category = cat
                name = nm
                exam_type = etype
                
                try:
                    q_num = int(soru_no)
                except ValueError:
                    continue
                    
                questions.append({
                    "qNum": q_num,
                    "domain": ders,
                    "subject": ders,
                    "area": alan,
                    "topic": konu,
                    "topicId": konu_id,
                    "difficulty": "Orta", # Default
                    "note": ""
                })
        
        if len(questions) > 0:
            templates.append({
                "id": template_id,
                "name": name,
                "category": category,
                "examScope": exam_type,
                "questions": questions
            })
            
    # Sort templates by category, then natural sort on name
    import re
    def sort_key(t):
        name_parts = [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', t["name"])]
        return (t["category"], name_parts)
        
    templates.sort(key=sort_key)
    
    output_data = {
        "templates": templates
    }
    
    os.makedirs("src/lib", exist_ok=True)
    with open("src/lib/exam-templates.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Başarıyla {len(templates)} sınav şablonu oluşturuldu.")

if __name__ == "__main__":
    main()
