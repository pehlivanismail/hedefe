# Canlı veritabanı güncellemesi

`original_subabase.sql` senin canlı veritabanının mevcut hali.
`live-sync.sql` ise uygulamanın şu anki kodunun beklediği hale getiren güncelleme.

Nasıl uygulanır:

1. Supabase panelinde **SQL Editor**'ü aç.
2. `db/live-sync.sql` dosyasının tamamını yapıştır ve çalıştır.
3. Hata almazsan iş bitti — mevcut veriler silinmez, sadece eksik sütun,
   fonksiyon, erişim kuralı ve indeksler eklenir.

Dosya tekrar tekrar çalıştırılabilir; ikinci çalıştırma bir şeyi bozmaz.

Uygulamanın hangi veritabanına bağlandığı `.env` içindeki
`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` değerleriyle belirlenir.
