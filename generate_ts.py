import json, re

with open('parsed_topics.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_id(s):
    # Convert Turkish characters and lowercase
    tr_map = str.maketrans("ğüşıöçĞÜŞİÖÇ", "gusiocGUSIOC")
    s = s.translate(tr_map).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

ea_mapping = {
    "ayt-matematik_esitagirlik.pdf": "Matematik",
    "ayt-tde_esitagirlik.pdf": "Türk Dili ve Edebiyatı",
    "ayt-tarih1_esitagirlik.pdf": "Tarih-1",
    "ayt_cografya1_esitagirlik.pdf": "Coğrafya-1",
    "ayt-cografya1_esitagirlik.pdf": "Coğrafya-1"
}

sozel_mapping = {
    "ayt-tde_sozel.pdf": "Türk Dili ve Edebiyatı",
    "ayt-tarih1_sozel.pdf": "Tarih-1",
    "ayt-cografya1_sozel.pdf": "Coğrafya-1",
    "ayt-tarih2_sozel.pdf": "Tarih-2",
    "ayt-cografya2_sozel.pdf": "Coğrafya-2",
    "ayt-felsefe_sozel.pdf": "Felsefe",
    "ayt-psikoloji_sozel.pdf": "Psikoloji",
    "ayt-sosyoloji_sozel.pdf": "Sosyoloji",
    "ayt-mantik_sozel.pdf": "Mantık"
}

def generate_exam(exam_id, name, track, mapping):
    subjects = []
    for file, subject_name in mapping.items():
        if file not in data: continue
        subj_id = f"{exam_id}-{clean_id(subject_name)}"
        areas = []
        for area in data[file]:
            area_id = f"{subj_id}-{clean_id(area['name'])}"
            topics = []
            for topic in area['topics']:
                topics.append({
                    "id": f"{area_id}-{clean_id(topic['name'])}",
                    "name": topic['name']
                })
            areas.append({
                "id": area_id,
                "name": area['name'],
                "topics": topics
            })
        subjects.append({
            "id": subj_id,
            "name": subject_name,
            "areas": areas
        })
    return {
        "id": exam_id,
        "name": name,
        "track": track,
        "subjects": subjects
    }

ea = generate_exam("ayt-esitagirlik", "AYT Eşit Ağırlık", "esit", ea_mapping)
sozel = generate_exam("ayt-sozel", "AYT Sözel", "sozel", sozel_mapping)

# Write to a TS string format
def dict_to_ts(d, indent=2):
    return json.dumps(d, ensure_ascii=False, indent=indent)

output = ",\n" + dict_to_ts(ea) + ",\n" + dict_to_ts(sozel)

with open('new_exams.json', 'w', encoding='utf-8') as f:
    f.write(output)

print("Generated new_exams.json")
