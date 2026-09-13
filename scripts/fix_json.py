import json

with open('new_exams.json', 'r', encoding='utf-8') as f:
    text = f.read()

# Since text has "id" and "name" for topics, we can just parse it and add the fields.
# Actually, text starts with `,\n{`
text = text.lstrip(',\n')
exams = json.loads('[' + text + ']')

for exam in exams:
    for subject in exam.get('subjects', []):
        for area in subject.get('areas', []):
            for topic in area.get('topics', []):
                topic['mastery'] = 0
                topic['debt'] = 0
                topic['logs'] = []

output = ",\n" + json.dumps(exams[0], ensure_ascii=False, indent=2) + ",\n" + json.dumps(exams[1], ensure_ascii=False, indent=2)

with open('new_exams_fixed.json', 'w', encoding='utf-8') as f:
    f.write(output)

print("Fixed!")
