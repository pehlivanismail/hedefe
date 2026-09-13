import os
import glob
import time
import pdfplumber
from google import genai
from google.genai import types

# ==========================================
# 1. AYARLAR VE API ANAHTARI
# ==========================================
API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    print("HATA: Lütfen GEMINI_API_KEY ortam değişkenini ayarlayın.")
    print('Örnek: export GEMINI_API_KEY="AIzaSy..."')
    exit(1)

client = genai.Client(api_key=API_KEY)

# ==========================================
# 2. KONU HAVUZU HAZIRLIĞI
# ==========================================
print("Konu havuzu (topics.csv) okunuyor...")
try:
    with open("topics.csv", "r", encoding="utf-8") as f:
        topics_csv = f.read()
except Exception as e:
    print("HATA: topics.csv dosyası okunamadı.", e)
    exit(1)

def get_system_prompt(exam_type):
    return f"""
Sen uzman bir YKS (TYT/AYT) eğitim danışmanısın. Sana bir {exam_type} deneme sınavının metnini vereceğim. 
Görevin, sınavdaki her bir soruyu analiz edip, sorunun hangi DERSE, ALANA ve KONUYA ait olduğunu tespit etmektir.

ÇOK ÖNEMLİ KURALLAR:
1. SADECE aşağıda sana verdiğim KONU HAVUZU'ndaki (topics.csv) Konu, Alan ve ID'leri kullanmalısın. Kendi kafandan konu veya alan ismi uydurma!
2. Çıktını SADECE CSV formatında ver. Ekstra hiçbir açıklama yazma, markdown kodu (```csv) kullanma.
3. CSV Başlığı tam olarak şöyle olmalıdır:
Ders,Soru No,Alan,Konu,AlanID,KonuID
4. Sınavdaki tüm sorular için sırayla satır üret.
5. Geometri sorularını 'Geometri' dersi olarak yazabilirsin fakat ID'lerini Matematik'in içindeki Geometri alanlarından seç.

İŞTE KULLANMAK ZORUNDA OLDUĞUN KONU HAVUZU (Hem TYT hem AYT konuları içerir, sınav tipine uygun olanı seç):
{topics_csv}
"""

# ==========================================
# 3. PDF'LERİ İŞLEME DÖNGÜSÜ (TÜM KLASÖRLER)
# ==========================================
ana_klasor = "docs/Sinavlar"
pdf_dosyalari = []

# Klasör içindeki tüm PDF'leri bul (Alt klasörler dahil)
for root, dirs, files in os.walk(ana_klasor):
    for file in files:
        if file.lower().endswith(".pdf"):
            pdf_dosyalari.append(os.path.join(root, file))

# İsimlerine göre sıralayalım
pdf_dosyalari.sort()

if not pdf_dosyalari:
    print("HATA: PDF dosyaları bulunamadı.")
    exit(1)

print(f"Toplam {len(pdf_dosyalari)} adet PDF dosyası işlenecek.")

for pdf_path in pdf_dosyalari:
    dosya_adi = os.path.basename(pdf_path)
    klasor = os.path.dirname(pdf_path)
    csv_adi = dosya_adi.replace(".pdf", "-konu-eslestirmesi.csv")
    csv_yolu = os.path.join(klasor, csv_adi)
    
    if os.path.exists(csv_yolu):
        print(f"ATLANDI: {csv_yolu} zaten mevcut.")
        continue

    print(f"\nİşleniyor: {dosya_adi} ({klasor})...")
    
    # Sınav tipini belirle (Klasör adından veya dosya adından)
    exam_type = "TYT"
    if "ayt" in pdf_path.lower():
        exam_type = "AYT"
    
    # PDF Metnini Çıkar
    pdf_metni = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pdf_metni += text + "\n"
    except Exception as e:
        print(f"PDF okuma hatası ({dosya_adi}):", e)
        continue
    
    if not pdf_metni.strip():
        print(f"UYARI: {dosya_adi} içinden metin çıkarılamadı.")
        continue
        
    print(f"Metin çıkarıldı ({exam_type} olarak algılandı). Gemini API'ye gönderiliyor...")
    
    max_retries = 10
    for attempt in range(max_retries):
        try:
            user_prompt = f"Lütfen aşağıdaki {dosya_adi} metnini analiz et ve sınavdaki tüm soruların CSV haritasını çıkar.\n\nSINAV METNİ:\n{pdf_metni}"
            
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=get_system_prompt(exam_type),
                    temperature=0.0
                )
            )
            
            import csv
            import io
            
            sonuc_csv = response.text.replace("```csv\n", "").replace("```", "").strip()
            
            relative_path = os.path.relpath(pdf_path, "docs/Sinavlar")
            
            reader = csv.reader(io.StringIO(sonuc_csv))
            rows = list(reader)
            
            if len(rows) > 0:
                # Başlık olup olmadığını kontrol et
                if "Soru" not in str(rows[0]) and "Ders" not in str(rows[0]):
                    rows.insert(0, ["Ders", "Soru No", "Alan", "Konu", "AlanID", "KonuID"])
                
                # İlk sütuna sınav yolunu ekle
                rows[0].insert(0, "Sinav Yolu")
                for i in range(1, len(rows)):
                    rows[i].insert(0, relative_path)
            
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerows(rows)
            final_csv_str = output.getvalue()
            
            with open(csv_yolu, "w", encoding="utf-8") as f:
                f.write(final_csv_str)
                
            print(f"BAŞARILI! Eşleştirme kaydedildi: {csv_yolu}")
            break
            
        except Exception as e:
            print(f"Gemini API Hatası ({dosya_adi}) - Deneme {attempt+1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                # 503 veya rate limit için bekleme süresini artırdık
                bekleme_suresi = 30 * (attempt + 1) 
                print(f"{bekleme_suresi} saniye bekleyip tekrar deneniyor...")
                time.sleep(bekleme_suresi)
            else:
                print("Maksimum deneme sayısına ulaşıldı, bu dosya atlanıyor.")
    
    # API limitlerine (rate limits) takılmamak için kısa bir bekleme süresi
    time.sleep(15)

print("\nTÜM İŞLEMLER TAMAMLANDI!")
