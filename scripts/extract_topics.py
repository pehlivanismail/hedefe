import csv
import string
import re

subjects = {
  "Matematik": {
    "DENKLEM VE EŞİTSİZLİKLER": [
      "Temel Kavramlar", "Tek - Çift Sayılar ve İşaret İncelemesi", "Ardışık Sayılar", "Faktöriyel", "Sayı Basamakları", "Asal ve Aralarında Asal Sayılar", "Asal Çarpanlara Ayırma ve Bölen Sayısı", "Bölme ve Bölünebilme Kuralları", "EBOB - EKOK", "Rasyonel Sayılar", "Birinci Dereceden Denklemler", "Birinci Dereceden Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar", "Çarpanlara Ayırma", "Oran - Orantı", "Sayı - Kesir Problemleri", "Yaş Problemleri", "İşçi Problemleri", "Hız - Hareket Problemleri", "Yüzde Problemleri", "Karışım Problemleri", "Sayısal Mantık Problemleri"
    ],
    "KÜMELER": ["Kümeler"],
    "FONKSİYONLAR": ["Fonksiyonlar"],
    "VERİ - SAYMA - OLASILIK": ["Merkezi Eğilim ve Yayılım Ölçüleri, Grafik Türleri", "Sayma, Permütasyon", "Kombinasyon", "Binom Açılımı", "Olasılık"],
    "İKİNCİ DERECEDEN DENKLEMLER": ["İkinci Dereceden Denklemler"],
    "POLİNOMLAR": ["Polinomlar"],
    "MANTIK": ["Mantık"],
    "ÜÇGENLER": ["Düzlemde Açı", "Üçgende Açı", "Dik Üçgen ve Trigonometri", "Üçgende Açı - Kenar Bağıntıları", "İkizkenar Üçgen", "Eşkenar Üçgen", "Üçgende Açıortay", "Üçgende Kenarortay", "Üçgende Merkezler", "Üçgende Benzerlik", "Üçgende Alan"],
    "DÖRTGENLER VE ÇOKGENLER": ["Çokgenler", "Dörtgenler", "Yamuk", "Paralelkenar", "Eşkenar Dörtgen", "Dikdörtgen", "Kare", "Deltoid ve Dörtgenlerin Sınıflandırılması"],
    "ÇEMBERLER": ["Çemberde Açılar", "Çemberde Uzunluk", "Dairede Alan"],
    "KATI CİSİMLER": ["Katı Cisimler"],
    "ANALİTİK GEOMETRİ": ["Noktanın Analitik İncelenmesi", "Doğrunun Analitik İncelenmesi"]
  },
  "Biyoloji": {
    "YAŞAM BİLİMİ BİYOLOJİ": ["Biyoloji ve Canlıların Ortak Özellikleri", "İnorganik Bileşikler", "Organik Bileşikler"],
    "HÜCRE": ["Sitoplazma ve Organeller", "Hücre Zarı", "Bilimsel Yöntem"],
    "CANLILAR DÜNYASI": ["Sınıflandırmanın Amacı ve Faydaları", "Sınıflandırmada Kullanılan Kategoriler", "İkili Adlandırma", "Canlı Âlemleri ve Özellikleri", "Protistler-Bitkiler-Mantarlar Âlemleri", "Hayvanlar Âlemi", "Virüsler"],
    "HÜCRE BÖLÜNMELERİ VE ÜREME": ["Hücre Bölünmesinin Gerekliliği", "Mitoz", "Eşeysiz Üreme", "Mayoz", "Eşeyli Üreme"],
    "KALITIMIN VE BİYOLOJİK ÇEŞİTLİLİK": ["Mendel İlkeleri", "Mendel İlkelerine Uymayan Durumlar / Eş Baskınlık - Çok Alellilik", "Kan Grupları", "Eşeye Bağlı Kalıtım", "Akraba Evlilikleri - Genetik Varyasyonlar ve Biyolojik Çeşitlilik"],
    "EKOSİSTEM EKOLOJİSİ VE GÜNCEL ÇEVRE SORUNLARI": ["Ekosistemin Canlı ve Cansız Bileşenleri", "Canlılardaki Beslenme Şekilleri", "Ekosistemde Madde ve Enerji Akışı", "Madde Döngüleri ve Hayatın Sürdürülebilirliği", "Güncel Çevre Sorunları"]
  },
  "Kimya": {
    "KİMYA BİLİMİ": ["Simyadan Kimyaya", "Kimya Disiplinleri ve Kimyacıların Çalışma Alanları", "Kimyanın Sembolik Dili", "Kimya Uygulamalarında İş Sağlığı ve Güvenliği"],
    "ATOMUN YAPISI VE PERİYODİK SİSTEM": ["Atom Modelleri", "Atomdaki Temel Tanecikler ve Eşitlikler", "Periyodik Sistem ve Elektron Dizilimleri", "Periyodik Sistemde Gruplar ve Özellikleri", "Periyodik Özelliklerin Değişimi"],
    "KİMYASAL TÜRLER ARASI ETKİLEŞİMLER": ["Kimyasal Türler", "Atom ve İyonların Lewis Yapısı", "İyonik Bileşiklerin Oluşumu ve Adlandırılması", "İyonik Bileşiklerde Çözünme", "Kovalent Bağlı Bileşiklerin Oluşumu ve Adlandırılması", "Kovalent Bağlı Moleküllerde Polarlık", "Metalik Bağ", "Van der Waals Etkileşimleri ve Hidrojen Bağı", "Fiziksel ve Kimyasal Değişimler"],
    "MADDENİN HALLERİ": ["Katılar ve Özellikleri", "Sıvılar ve Özellikleri", "Gazlar ve Özellikleri", "Saf Maddelerde Hal Değişimi"],
    "DOĞA VE KİMYA": ["Su ve Hayat", "Çevre Kimyası"],
    "KİMYASAL HESAPLAMALAR": ["Kütlenin Korunumu Kanunu", "Sabit Oranlar Kanunu", "Katlı Oranlar Kanunu", "Mol Kavramı", "Tepkime Denklemi ve Tepkime Denkleştirme", "Yanma Tepkimeleri", "Asit - Baz (Nötralleşme) Tepkimeleri", "Analiz - Sentez ve Çözünme - Çökelme Tepkimeleri", "Tepkime Denkleminde Mollü Geçiş Problemleri", "Sınırlayıcı Bileşen - Verim ve Artan Madde Problemleri", "Saflık - Karışım - Formül Bulma Problemleri"],
    "KARIŞIMLAR": ["Homojen - Heterojen Karışımlar ve Çözünme Süreci", "Kütlece Yüzde Derişim", "Derişim Çeşitleri ve ppm Kavramı", "Koligatif Özellikler", "Tanecik Boyutu Farkıyla Ayırma", "Yoğunluk Farkıyla Ayırma", "Çözünürlük Farkıyla Ayırma", "Kaynama Noktası Farkıyla Ayırma"],
    "ASİTLER, BAZLAR VE TUZLAR": ["Asitler, Bazlar ve Özellikleri", "Nötralleşme Tepkimeleri", "pH ve pOH Kavramları - Asit Baz İndikatörleri", "Asitler ve Bazların Metallerle Tepkimeleri", "Yaygın Asit ve Bazların Kullanım Alanları", "Asit ve Bazların Fayda ve Zararları", "Tuzlar"],
    "KİMYA HER YERDE": ["Temizlik Malzemeleri", "Polimerler", "Kozmetikler ve İlaçlar", "Hazır Gıdalar", "Yenilebilir Yağ Türleri"],
    "BECERİ TEMELLİ YENİ NESİL SORULAR": ["Beceri Temelli Yeni Nesil Sorular"]
  },
  "Coğrafya": {
    "DOĞA VE İNSAN": ["İnsan, Doğa ve Coğrafya"],
    "DÜNYA'NIN ŞEKLİ VE HAREKETLERİ": ["Dünya'nın Şekli ve Sonuçları", "Dünya'nın Günlük ve Yıllık Hareketleri", "Mevsimlerin Oluşumu ve Özel Tarihler"],
    "COĞRAFİ KONUM VE YEREL SAATLER": ["Coğrafi Koordinatlar, Paralel, Meridyen, Enlem, Boylam", "Yerel Saat, Ortak Saat, Uluslararası Saat Dilimleri", "Türkiye'nin Coğrafi Konumu"],
    "HARİTA BİLGİSİ": ["Harita Bilgisi", "İzohipsler", "Harita Çalışması"],
    "İKLİM BİLGİSİ (ATMOSFER VE SICAKLIK)": ["İklim - Hava Durumu - Atmosfer", "İklim Bilgisi - Sıcaklık"],
    "İKLİM BİLGİSİ (BASINÇ VE RÜZGÂRLAR)": ["İklim Bilgisi, Basınç", "İklim Bilgisi, Rüzgârlar"],
    "İKLİM BİLGİSİ (NEMLİLİK VE YAĞIŞ)": ["İklim Bilgisi - Nem", "İklim Bilgisi - Yağış"],
    "İKLİM BİLGİSİ (BÜYÜK İKLİM TİPLERİ)": ["Büyük İklim Tipleri"],
    "TÜRKİYE'NİN İKLİMİ": ["Türkiye'nin İklimini Etkileyen Faktörler", "Türkiye'nin İklim Elemanları", "Türkiye'de Görülen İklim Tipleri"],
    "YERİN YAPISI VE OLUŞUM SÜRECİ": ["Yerin Yapısı ve Jeolojik Devirler", "Topoğrafya ve Kayaçlar", "Levha Tektoniği ve İç Kuvvetler"],
    "DIŞ KUVVETLER": ["Kayaçların Çözülmesi - Toprak ve Kütle Hareketleri", "Rüzgârların Oluşturduğu Yer Şekilleri", "Akarsular ve Oluşturduğu Yer Şekilleri", "Karstik Şekiller", "Buzul - Dalga ve Akıntıların Oluşturduğu Şekiller", "Kıyı Tipleri"],
    "TÜRKİYE'NİN YER ŞEKİLLERİ": ["Türkiye'nin Yeryüzü Şekillerinin Genel Özellikleri", "Türkiye'nin Dağları, Ovaları, Platoları", "Türkiye'de Akarsular ve Oluşturdukları Şekiller", "Türkiye'de Karstik Şekiller - Dalga ve Akıntıların Oluşturduğu Yer Şekilleri - Kıyı Tipleri"],
    "DOĞADAKİ ÜÇ UNSUR: SU, TOPRAK VE BİTKİ": ["Su Kaynakları - Türkiye'nin Su Varlığı", "Toprağın Hikâyesi ve Türkiye'de Toprak", "Dünya'yı Kaplayan Örtü: Bitkiler ve Türkiye'de Bitkiler"],
    "NÜFUSUN GELİŞİMİ, DAĞILIŞI VE NİTELİKLERİ": ["Beşeri Yapı", "Yerleşme Tipleri ve Özellikleri", "Nüfusun Özellikleri ve Dağılışı", "Nüfus Piramitleri ve Özellikleri", "Göçler", "Ekonomik Faaliyetlerin Sınıflandırılması"],
    "TÜRKİYE'NİN NÜFUS ÖZELLİKLERİ VE NÜFUS HAREKETLERİ": ["Türkiye'de Nüfus ve Yerleşmeyi Etkileyen Faktörler", "Türkiye'de Nüfus ve Yerleşme", "Türkiye'de Nüfusun Yapısal Özellikleri", "Türkiye'de Nüfusun Tarihsel Değişimi ve Göçler"],
    "KÜRESEL ORTAM: BÖLGELER VE ÜLKELER": ["Bölge Kavramı ve Türleri", "Ulaşım", "Kıtaların Keşfi: Küçülen Dünya - Ulaşım"],
    "ÇEVRE VE TOPLUM": ["Çevre ve İnsan", "Doğal Afetler"]
  },
  "Fizik": {
    "FİZİK BİLİMİNE GİRİŞ": ["Fizik Biliminin Tanımı ve Diğer Disiplinlerle İlişkisi", "Fizik Biliminin Alt Dalları", "Fiziksel Niceliklerin Sınıflandırılması", "Bilimsel Araştırma Merkezleri ve Bilimsel Etik"],
    "MADDE VE ÖZELLİKLERİ": ["Kütle - Hacim ve Özkütle", "Katılarda Boyutlar Arası İlişkiler ve Dayanıklılık", "Adesyon, Kohezyon, Yüzey Gerilimi ve Kılcallık"],
    "BASINÇ": ["Katı Basıncı", "Sıvı Basıncı", "Gaz Basıncı", "Akışkanlar Mekaniği"],
    "KALDIRMA KUVVETİ": ["Sıvıların Kaldırma Kuvveti"],
    "ISI - SICAKLIK VE GENLEŞME": ["Isı, Sıcaklık ve İç Enerji", "Termometreler", "Isı Alış - Verişi ve Isıl Denge", "Hal Değişimi", "Isının Yayılma Yolları", "Genleşme", "Küresel Isınma ve Hissedilen Sıcaklık"],
    "HAREKET": ["Hareket Kavramı ve Çeşitleri", "Temel Hareket Kavramları", "Düzgün Doğrusal Hareket", "İvme", "Boyutlu Cisimlerin Hareketi"],
    "NEWTON'UN HAREKET YASALARI": ["Kuvvetin Özellikleri ve Kuvvet Çeşitleri", "Newton'ın Birinci Hareket Yasası : Eylemsizlik", "Newton'ın İkinci Hareket Yasası : Kuvvet - İvme İlişkisi", "Newton'ın Üçüncü Hareket Yasası : Etki - Tepki Kuvveti", "Sürtünme Kuvveti"],
    "İŞ - GÜÇ - ENERJİ": ["İş", "Güç", "Enerji", "Enerjinin Korunumu", "Enerji Kaynakları"],
    "ELEKTRİK VE MANYETİZMA": ["Elektrostatik", "Direnç ve Dirençlerin Bağlanması", "Elektrik Akımı ve Potansiyel Fark", "Üreteçler", "Elektrik Enerjisi ve Güç", "Lambalı Devreler", "Mıknatıslar", "Akım - Manyetik Alan İlişkisi"],
    "OPTİK": ["Aydınlanma", "Gölge Oluşumu", "Düzlem Aynalar", "Küresel Aynalar", "Kırılma", "Renkler", "Mercekler"],
    "DALGALAR": ["Dalgaların Genel Özellikleri", "Ses Dalgaları", "Yay Dalgaları", "Su Dalgaları"]
  },
  "Tarih": {
    "TARİH VE ZAMAN": ["Tarih ve Zaman"],
    "İNSANLIĞIN İLK DÖNEMLERİ": ["İnsanlığın İlk Dönemleri"],
    "ORTA ÇAĞ'DA DÜNYA VE TÜRKLER": ["Orta Çağ'da Dünya", "İlk ve Orta Çağlarda Türk Dünyası"],
    "İSLAM MEDENİYETİNİN DOĞUŞU": ["İslam Medeniyetinin Doğuşu"],
    "TÜRKLERİN İSLAMİYET'İ KABULÜ VE İLK TÜRK İSLAM DEVLETLERİ": ["Türklerin İslamiyet'i Kabulü", "Karahanlılar ve Gazneliler", "Büyük Selçuklular"],
    "YERLEŞME VE DEVLETLEŞME SÜRECİNDE SELÇUKLU TÜRKİYESİ": ["Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi"],
    "BEYLİKTEN DEVLETE OSMANLI": ["Beylikten Devlete Osmanlı Siyaseti (1302 - 1453)", "Devletleşme Sürecinde Savaşçılar ve Askerler", "Beylikten Devlete Osmanlı Medeniyeti", "Dünya Gücü Osmanlı (1453 - 1595)", "Sultan ve Osmanlı Merkez Teşkilatı", "Klasik Çağda Osmanlı Toplum Düzeni"],
    "DEĞİŞEN DÜNYA DENGELERİ": ["Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595 - 1774)", "Değişim Çağında Avrupa ve Osmanlı"],
    "ULUSLARARASI İLİŞKİLERDE DENGE": ["Devrimler Çağında Değişen Devlet Toplum İlişkileri", "Uluslararası İlişkilerde Denge Stratejisi (1774 - 1914)", "XIX ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat"],
    "XX. YÜZYIL BAŞLARINDA OSMANLI DEVLETİ VE DÜNYA": ["1881'den 1919'a Mustafa Kemal", "I. Dünya Savaşı", "Mondros Ateşkesi"],
    "MİLLÎ MÜCADELE - I": ["İşgallere Tepkiler, Cemiyetler ve Kuvayımilliye", "Mustafa Kemal'in Samsun'a Çıkışı ve Havza Genelgesi", "Amasya Genelgesi", "Erzurum Kongresi", "Sivas Kongresi", "Amasya Görüşmeleri ve Misakımilli", "I. TBMM", "Sevr Anlaşması"],
    "MİLLÎ MÜCADELE - II": ["Kurtuluş Savaşı", "Lozan Antlaşması"],
    "ATATÜRKÇÜLÜK VE TÜRK İNKILABI": ["Atatürk İlkeleri", "Türk İnkılabı"],
    "İKİ SAVAŞ ARASI DÖNEMDE TÜRKİYE VE DÜNYA": ["İki Savaş Arası Dönemde Türkiye ve Dünya"],
    "II. DÜNYA SAVAŞI SÜRECİNDE VE SONRASINDA TÜRKİYE VE DÜNYA": ["II. Dünya Savaşı Sürecinde Türkiye ve Dünya", "II. Dünya Savaşı Sonrasında Türkiye ve Dünya", "Toplumsal Devrim Çağında Dünya ve Türkiye", "XXI. Yüzyılın Eşiğinde Türkiye ve Dünya"]
  },
  "Türkçe": {
    "ANLAM BİLGİSİ": ["Sözcükte Anlam Özelliği", "Sözcükte Anlam İlişkisi", "Sözcükte Anlam Olayları", "Deyim - Atasözü - İkileme", "Söz Öbekleri", "Cümlede Anlam / Cümleyi Yorumlama", "Cümlede Anlam / Anlam İlişkileri - Anlatım", "Cümlede Anlam / Kavramlar", "Paragrafta Yapı", "Paragrafta Anlam", "Anlatım Biçimleri / Düşünceyi Geliştirme Yolları", "Paragrafta Çoklu Soru"],
    "DİL BİLGİSİ": ["Kök Bilgisi", "Çekim Eki", "Yapım Eki", "Ekler (Karma)", "Sözcükte Yapı", "İsimler (Adlar)", "Sıfatlar (Ön Ad)", "Zamir (Adıl)", "Tamlamalar", "Zarf (Belirteç)", "Edat, Bağlaç, Ünlem", "Eylemler (Fiiller)", "Ek Eylem (Ek Fiil)", "Eylemsi (Fiilimsi)", "Cümlenin Ögeleri", "Fiilde Çatı", "Cümle Türleri"],
    "SES, YAZIM, NOKTALAMA VE ANLATIM BOZUKLUĞU": ["Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcük Düzeyinde Anlatım Bozuklukları", "Cümle Düzeyinde Anlatım Bozuklukları"],
    "İLETİŞİM VE METİN BİLGİSİ": ["İletişim / Dilin İşlevleri - Dilin Kullanımından Doğan Türleri", "Metin İnceleme"],
    "YENİ NESİL SORULAR": ["Beceri Temelli Yeni Nesil Sorular"]
  },
  "Din Kültürü ve Ahlak Bilgisi": {
    "İNSAN VE İNANÇ": ["Bilgi ve İnanç", "Din ve İslam", "Allah ve İnsan İlişkisi", "Dünya ve Ahiret Hayatı", "Kur'an'dan Bazı Kavramlar", "İnançla İlgili Meseleler"],
    "GÜNÜMÜZDE YAŞAYAN DİNLER": ["Yahudilik ve Hristiyanlık", "Hint ve Çin Dinleri"],
    "İSLAM VE HAYAT": ["İslam ve İbadet", "Gençlik ve Değerler", "Gönül Coğrafyamız", "Din ve Hayat", "Ahlaki Tutum ve Davranışlar", "İslam ve Bilim", "Güncel Dini Meseleler"],
    "HZ. MUHAMMED": ["Hz. Muhammed ve Gençlik", "Kur'an'a Göre Hz. Muhammed"],
    "İSLAM'DA YORUMLAR": ["İslam Düşüncesinde İtikadi, Siyasi ve Fıkhi Yorumlar", "Anadolu'da İslam", "İslam Düşüncesinde Tasavvufi Yorumlar"]
  }
}

def to_id(text):
    text = text.lower()
    text = text.replace('ç', 'c').replace('ğ', 'g').replace('ı', 'i').replace('i̇', 'i').replace('ö', 'o').replace('ş', 's').replace('ü', 'u')
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

with open('/Users/ismailpehlivan/Documents/hedefe.net/topics.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    rows = list(reader)

header = rows[0]
old_data = rows[1:]

subjects_to_replace = set(subjects.keys())

filtered_data = []
for row in old_data:
    sinav, ders = row[0], row[1]
    if sinav == 'TYT' and ders in subjects_to_replace:
        continue # skip old ones
    filtered_data.append(row)

# Append new ones
new_data = []
for ders, alanlar in subjects.items():
    for alan, konular in alanlar.items():
        for konu in konular:
            sinav_id = 'tyt'
            ders_id = f'tyt-{to_id(ders)}'
            alan_id = f'{ders_id}-{to_id(alan)}'
            konu_id = f'{alan_id}-{to_id(konu)}'
            
            # Sınav ID, Ders, Alan, Konu, Sınav ID(lower), Ders ID, Alan ID, Konu ID
            new_row = ['TYT', ders, alan, konu, sinav_id, ders_id, alan_id, konu_id]
            new_data.append(new_row)

final_data = filtered_data + new_data
# Sort: first by Exam (TYT first), then Ders, then Alan, then Konu
# But maybe we just want to sort by Exam and Ders. Let's just preserve insertion order of new_data for the new rows.
# But it's better to sort all by Exam (TYT first) then Ders (alphabetical)
final_data.sort(key=lambda x: (0 if x[0] == 'TYT' else 1, x[1])) 

with open('/Users/ismailpehlivan/Documents/hedefe.net/topics.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(final_data)

print("topics.csv has been updated!")
