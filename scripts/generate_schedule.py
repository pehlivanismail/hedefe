import csv
from datetime import datetime, timedelta

def is_weekend(date):
    return date.weekday() >= 5  

def next_workday(date):
    date += timedelta(days=1)
    while is_weekend(date):
        date += timedelta(days=1)
    return date

# TYT Dependencies for AYT Alans
DEPENDENCIES = {
    # AYT Mat -> TYT Mat
    'POLİNOMLAR': ['POLİNOMLAR'],
    'II. DERECEDEN DENKLEMLER': ['İKİNCİ DERECEDEN DENKLEMLER', 'DENKLEM VE EŞİTSİZLİKLER'],
    'DENKLEM VE EŞİTSİZLİK SİSTEMLERİ': ['DENKLEM VE EŞİTSİZLİKLER'],
    'FONKSİYONLAR': ['FONKSİYONLAR'],
    'II. DERECEDEN FONKSİYONLARIN GRAFİKLERİ': ['FONKSİYONLAR'],
    'TRİGONOMETRİ': ['GEOMETRİ-ÜÇGENLER'],
    'LOGARİTMA': ['FONKSİYONLAR', 'DENKLEM VE EŞİTSİZLİKLER'],
    'DİZİLER': ['FONKSİYONLAR'],
    'LİMİT VE SÜREKLİLİK': ['FONKSİYONLAR'],
    'TÜREV': ['FONKSİYONLAR'],
    'İNTEGRAL': ['FONKSİYONLAR'],
    'SAYMA VE OLASILIK': ['VERİ - SAYMA - OLASILIK'],
    'GEOMETRİ-ÇOKGENLER VE DÖRTGENLER': [],
    'GEOMETRİ-DÖRTGENLER VE ÇOKGENLER': [],
    'GEOMETRİ-ÜÇGENLER': [],
    'GEOMETRİ-ANALİTİK GEOMETRİ': [],
    'GEOMETRİ-ÇEMBERLER': [],
    'GEOMETRİ-UZAY GEOMETRİSİ VE KATI CİSİMLER': [],
    
    # AYT Fizik -> TYT Fizik
    'HAREKET': ['HAREKET'],
    'KUVVET VE DENGE': ["NEWTON'UN HAREKET YASALARI"],
    'DİNAMİK VE ENERJİ': ['İŞ - GÜÇ - ENERJİ'],
    'ELEKTRİKSEL ALAN VE POTANSİYEL': ['ELEKTRİK VE MANYETİZMA'],
    'MANYETİZMA VE İNDÜKSİYON': ['ELEKTRİK VE MANYETİZMA'],
    'ÇEMBERSEL VE HARMONİK HAREKET': ['HAREKET', "NEWTON'UN HAREKET YASALARI"],
    'DALGA MEKANİĞİ': ['DALGALAR']
}

def get_topics():
    topics_list = []
    with open('/Users/ismailpehlivan/Documents/hedefe.net/topics.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            topics_list.append(row)
    return topics_list

def generate_schedule():
    topics_list = get_topics()
    
    streams = {
        'tyt_mat': [],
        'tyt_fen_Fizik': [],
        'tyt_fen_Kimya': [],
        'tyt_fen_Biyoloji': [],
        'ayt_mat': [],
        'ayt_fen_Fizik': [],
        'ayt_fen_Kimya': [],
        'ayt_fen_Biyoloji': [],
        'tyt_tur': []
    }
    
    for row in topics_list:
        sinav, ders, alan, konu, s_id, d_id, a_id, k_id = row
        stream_key = None
        if sinav == 'TYT' and ders == 'Matematik': stream_key = 'tyt_mat'
        elif sinav == 'TYT' and ders in ['Fizik', 'Kimya', 'Biyoloji']: stream_key = f'tyt_fen_{ders}'
        elif sinav == 'AYT' and ders == 'Matematik': stream_key = 'ayt_mat'
        elif sinav == 'AYT' and ders in ['Fizik', 'Kimya', 'Biyoloji']: stream_key = f'ayt_fen_{ders}'
        elif sinav == 'TYT' and ders == 'Türkçe': stream_key = 'tyt_tur'
            
        if stream_key:
            streams[stream_key].append(row)
            
    # Instead of a flat list, let's keep queues as lists of Alans (groups of tasks)
    queues = {k: [] for k in streams.keys()}
    
    for stream_key, rows in streams.items():
        grouped = {}
        # maintain order
        order = []
        for row in rows:
            ders = row[1]
            alan = row[2]
            key = (ders, alan)
            if key not in grouped:
                grouped[key] = []
                order.append(key)
            grouped[key].append(row)
            
        for key in order:
            items = grouped[key]
            ders, alan = key
            sinav = items[0][0]
            alan_id = items[0][6]
            
            alan_tasks = []
            for row in items:
                alan_tasks.append({
                    'type': 'Konu & Soru',
                    'Sinav': sinav,
                    'Ders': ders,
                    'Alan': alan,
                    'Alan_ID': alan_id,
                    'Konu_ID': row[7],
                    'Text': row[3]
                })
            
            queues[stream_key].append({'alan': alan, 'tasks': alan_tasks})
                    
    current_date = datetime.strptime("14.09.2026", "%d.%m.%Y")
    schedule = []
    
    chunks = {
        'tyt_mat': 2,
        'tyt_fen': 4,
        'ayt_mat': 1,
        'ayt_fen': 4,
        'tyt_tur': 1
    }
    
    completed_tyt_alans = set()

    def process_block(stream_key, block_num, max_tasks):
        tasks_done = 0
        while tasks_done < max_tasks and queues[stream_key]:
            # Find the first Alan whose dependencies are met
            idx_to_pop = -1
            for i, alan_group in enumerate(queues[stream_key]):
                alan_name = alan_group['alan']
                # Check dependencies only for AYT streams
                deps = DEPENDENCIES.get(alan_name, []) if stream_key.startswith('ayt_') else []
                can_process = True
                for dep in deps:
                    if dep not in completed_tyt_alans:
                        can_process = False
                        break
                if can_process:
                    idx_to_pop = i
                    break
            
            if idx_to_pop == -1:
                break # Blocked entirely due to dependencies
            
            # Pop task from the active alan
            active_alan = queues[stream_key][idx_to_pop]
            task = active_alan['tasks'].pop(0)
            
            schedule.append([current_date.strftime("%d.%m.%Y"), block_num, task['type'], task['Sinav'], task['Ders'], task['Alan_ID'], task['Konu_ID']])
            tasks_done += 1
            
            # If the alan is now empty, remove it and mark as completed (if TYT)
            if len(active_alan['tasks']) == 0:
                if stream_key.startswith('tyt_'):
                    completed_tyt_alans.add(active_alan['alan'])
                queues[stream_key].pop(idx_to_pop)

    tyt_fen_order = ['Fizik', 'Kimya', 'Biyoloji']
    ayt_fen_order = ['Fizik', 'Kimya', 'Biyoloji']
    tyt_fen_idx = 0
    ayt_fen_idx = 0

    while any(len(q) > 0 for q in queues.values()):
        tasks_before = len(schedule)
        
        # Morning blocks
        process_block('tyt_mat', 1, chunks['tyt_mat'])
        
        # Rotate TYT Fen
        for _ in range(3):
            subj = tyt_fen_order[tyt_fen_idx]
            tyt_fen_idx = (tyt_fen_idx + 1) % 3
            q_key = f'tyt_fen_{subj}'
            if queues[q_key]:
                process_block(q_key, 2, chunks['tyt_fen'])
                break
        
        # Afternoon blocks
        process_block('ayt_mat', 3, chunks['ayt_mat'])
        
        # Rotate AYT Fen
        for _ in range(3):
            subj = ayt_fen_order[ayt_fen_idx]
            ayt_fen_idx = (ayt_fen_idx + 1) % 3
            q_key = f'ayt_fen_{subj}'
            # Check if this queue has elements AND can be processed (dependencies met)
            # process_block will return True if it processed something, let's just let it run.
            # But process_block currently returns nothing. Let's rely on tasks_before.
            tb = len(schedule)
            if queues[q_key]:
                process_block(q_key, 4, chunks['ayt_fen'])
                if len(schedule) > tb:
                    break
        
        # Evening block
        process_block('tyt_tur', 5, chunks['tyt_tur'])
        
        if len(schedule) == tasks_before:
            print("Deadlock detected! Breaking loop to avoid infinite date increment.")
            for k, q in queues.items():
                if q:
                    print(f"Queue {k} blocked on: {[a['alan'] for a in q[:3]]}")
            break
            
        current_date = next_workday(current_date)
        
    with open('/Users/ismailpehlivan/Documents/hedefe.net/ders_programi_generated.csv', 'w', newline='') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(['Tarih', 'Siralama', 'Konu/Soru', 'Sinav', 'Ders', 'Alan', 'Konu ID'])
        writer.writerows(schedule)
        
    print(f"Generated {len(schedule)} rows. End date: {schedule[-1][0]}")

if __name__ == '__main__':
    generate_schedule()
