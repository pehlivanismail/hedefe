import uuid

student_id = '98af1064-f103-4aab-b9ff-a2b86e1347d8'
sql_statements = ["BEGIN;"]

for week in range(8):
    # Saturday TYT Deneme
    task_id = str(uuid.uuid4())
    sql_statements.append(
        f"INSERT INTO public.tasks (id, student_id, kind, subject, area_name, title, topic_id, area_id, day, week_offset, sort_order, done) "
        f"VALUES ('{task_id}', '{student_id}', 'deneme', 'TYT', NULL, 'Haftalık TYT Denemesi', NULL, NULL, 5, {week}, 1, false);"
    )
    
    # Sunday AYT Deneme
    task_id = str(uuid.uuid4())
    sql_statements.append(
        f"INSERT INTO public.tasks (id, student_id, kind, subject, area_name, title, topic_id, area_id, day, week_offset, sort_order, done) "
        f"VALUES ('{task_id}', '{student_id}', 'deneme', 'AYT', NULL, 'Haftalık AYT Denemesi', NULL, NULL, 6, {week}, 1, false);"
    )

sql_statements.append("COMMIT;")

with open('/Users/ismailpehlivan/Documents/hedefe.net/add_denemeler.sql', 'w') as f:
    f.write('\n'.join(sql_statements))

print("Generated add_denemeler.sql")
