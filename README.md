# Lex Comparativa — veb-sayt sifatida joylash qo'llanmasi

Manbaga asoslangan qiyosiy huquqiy yordamchi (O'zbekiston · AQSh · Yevropa Ittifoqi).
Bu papka — to'liq tayyor veb-ilova. Quyidagi qadamlar bilan uni hammaga ochiq,
public manzilli (URL) saytga aylantirasiz.

---

## ⚠️ Eng muhim xavfsizlik qoidasi

**API kalitingizni hech qachon frontend (brauzer) kodiga yoki GitHub'ga qo'ymang.**

Bu loyihada kalit faqat serverda — `api/chat.js` ichida, `ANTHROPIC_API_KEY`
nomli muhit o'zgaruvchisi (environment variable) sifatida ishlatiladi. Brauzer faqat
`/api/chat` manziliga murojaat qiladi va kalitni hech qachon ko'rmaydi.

---

## 1. Sizga nima kerak

- **Node.js** (18+ versiya) — kompyuterda
- **Anthropic API kaliti** — https://console.anthropic.com
- **GitHub** akkaunti (bepul)
- **Vercel** akkaunti (bepul) — https://vercel.com

### API kalitini olish va sozlash
1. console.anthropic.com → **Settings → API Keys** → yangi kalit yarating.
2. **Billing** bo'limida to'lov usulini qo'shing (ishlatilgan tokenlar uchun haq olinadi).
3. **Web Search** funksiyasini Console sozlamalarida **yoqing** (yoqilmasa qidiruv ishlamaydi).
4. Tavsiya: **Limits / Spend cap** bo'limida oylik xarajat chegarasini belgilang.

---

## 2. Joylashning eng oson yo'li (GitHub + Vercel)

1. Bu papkani yangi **GitHub repozitoriysiga** yuklang
   (yoki `git init && git add . && git commit -m "init"` va GitHub'ga push).
   `.gitignore` allaqachon `.env` va `node_modules`ni chiqarib tashlaydi.

2. **vercel.com → Add New → Project → Import** qilib o'sha repozitoriyni tanlang.
   Vercel Vite loyihasini avtomatik aniqlaydi (build buyrug'ini o'zgartirish shart emas).

3. Import oynasida **Environment Variables** bo'limiga qo'shing:
   ```
   Name:  ANTHROPIC_API_KEY
   Value: sk-ant-...   (sizning kalitingiz)
   ```

4. **Deploy** tugmasini bosing. Bir-ikki daqiqada public URL tayyor bo'ladi
   (masalan: `https://lex-comparativa.vercel.app`). Shu havolani istalgan odam ochadi.

> Kalitni o'zgartirsangiz yoki birinchi marta qo'shsangiz, Vercel'da loyihani
> qayta **Redeploy** qiling.

---

## 3. Muqobil: Vercel CLI orqali

```bash
npm i -g vercel
cd lex-comparativa
vercel                       # birinchi marta — loyihani bog'laydi
vercel env add ANTHROPIC_API_KEY    # kalitni so'raydi
vercel --prod                # public deploy
```

---

## 4. Lokal sinov (ixtiyoriy)

`/api/chat` funksiyasi Vercel muhitida ishlaydi, shuning uchun lokalda to'liq
sinash uchun:

```bash
npm install
vercel dev        # frontend + /api birga ishlaydi (kalit .env.local da bo'lsin)
```

Faqat dizaynni ko'rish uchun (API ishlamaydi):
```bash
npm run dev
```

`.env.example` faylini `.env.local` ga nusxalang va kalitingizni qo'ying.

---

## 5. Public sayt — amaliy ogohlantirishlar

- **Har bir tashrifchining savoli sizning hisobingizdan pul sarflaydi.** Veb-qidiruv
  yoqilgani uchun qo'shimcha token haqi ham qo'shiladi. Console'da **spend cap**
  qo'ying.
- Suiiste'molni cheklash uchun keyinchalik **rate limiting** (so'rovlar soni
  chegarasi), oddiy **parol himoyasi** yoki kunlik limit qo'shishni o'ylab ko'ring.
- Ilovada huquqiy **disclaimer** allaqachon ko'rsatiladi. Ommaviy foydalanish uchun
  qisqa **Foydalanish shartlari** sahifasini qo'shish foydali.
- Manbalarni faqat rasmiy huquqiy bazalar bilan cheklamoqchi bo'lsangiz,
  `api/chat.js` ichidagi `allowed_domains` qatorini oching (lex.uz, eur-lex va h.k.).

---

## Papka tuzilishi

```
lex-comparativa/
├── api/
│   └── chat.js          # serverless proxy — kalit shu yerda yashiringan
├── src/
│   ├── App.jsx          # asosiy interfeys (4 rejim, 3 til, eksport, matritsa)
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

---

*Bu vosita ma'lumot beruvchi xususiyatga ega va malakali yuristning maslahatini
almashtirmaydi. Iqtiboslarni asl manbada tekshiring.*
