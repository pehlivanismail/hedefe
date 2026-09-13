import csv
import uuid
from datetime import datetime

student_id = '98af1064-f103-4aab-b9ff-a2b86e1347d8'
start_date = datetime.strptime('14.09.2026', '%d.%m.%Y')

topics = {}
areas = {}
with open('/Users/ismailpehlivan/Documents/hedefe.net/topics.csv', 'r') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        topics[row[7]] = row[3].replace("'", "''") # topic_id -> topic_name
        areas[row[6]] = row[2].replace("'", "''") # area_id -> area_name

sql_statements = [
    "BEGIN;",
    f"DELETE FROM public.tasks WHERE student_id = '{student_id}';"
]

with open('/Users/ismailpehlivan/Documents/hedefe.net/ders_programi.csv', 'r') as f:
    reader = csv.reader(f, delimiter='\t')
    header = next(reader)
    for row in reader:
        if not row: continue
        date_str, siralama, type_str, sinav, ders, area_id, konu_id = row
        current_date = datetime.strptime(date_str, '%d.%m.%Y')
        days_diff = (current_date - start_date).days
        week_offset = days_diff // 7
        day = current_date.weekday()
        
        subject = f"{sinav} {ders}"
        area_name = areas.get(area_id, area_id)
        title = topics.get(konu_id, area_name)
        sort_order = int(siralama)
        
        # We need two tasks: 'konu' and 'soru'
        for kind in ['konu', 'soru']:
            task_id = str(uuid.uuid4())
            konu_val = f"'{konu_id}'" if konu_id else "NULL"
            sql = f"INSERT INTO public.tasks (id, student_id, kind, subject, area_name, title, topic_id, area_id, day, week_offset, sort_order, done) VALUES ('{task_id}', '{student_id}', '{kind}', '{subject}', '{area_name}', '{title}', {konu_val}, '{area_id}', {day}, {week_offset}, {sort_order}, false);"
            sql_statements.append(sql)

sql_statements.append("COMMIT;")

with open('/Users/ismailpehlivan/Documents/hedefe.net/apply_schedule.sql', 'w') as f:
    f.write('\n'.join(sql_statements))
print(f"Generated {len(sql_statements)-3} SQL insert statements in apply_schedule.sql.")
