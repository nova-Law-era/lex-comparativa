import React, { useState, useRef, useEffect } from "react";

// ============================================================
//  LEX COMPARATIVA  ·  v2
//  AI-grounded comparative legal assistant (Uzbekistan · USA · EU)
//  Modes: Q&A · Document Analysis · Comparative Matrix · Glossary
//  Features: source-grounded citations (web search), comparative
//  matrix output, Word export, methodology panel. Languages: uz/en/ru.
// ============================================================

const LANGS = [
  { id: "uz", label: "O'zbek" },
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
];

const LANG_NAME = { uz: "Uzbek", en: "English", ru: "Russian" };

// Authoritative legal sources the model is told to prioritise
const SOURCE_GUIDE =
  "Prioritise OFFICIAL primary sources and cite specific article/section numbers when found. " +
  "Uzbekistan: lex.uz (official legislation database) — cite codex/law and article number. " +
  "European Union: eur-lex.europa.eu — cite the Regulation/Directive number and article. " +
  "United States: law.cornell.edu (Legal Information Institute), congress.gov, govinfo.gov — cite the U.S.C. title/section or case. " +
  "If you cannot verify an exact citation, state the principle generally and flag it with the marker ⚠︎ rather than inventing a citation.";

const T = {
  uz: {
    brand: "Lex Comparativa",
    tagline: "Manbaga asoslangan qiyosiy huquqiy yordamchi · O‘zbekiston — AQSh — Yevropa Ittifoqi",
    modes: { qa: "Savol-javob", analyze: "Hujjat tahlili", compare: "Qiyosiy matritsa", glossary: "Atamalar" },
    modeDesc: {
      qa: "Huquqiy savolga manbaga asoslangan javob",
      analyze: "Shartnoma/hujjatni yuklang va tahlil qildiring",
      compare: "Mavzuni uch yurisdiksiyada jadval ko‘rinishida qiyoslang",
      glossary: "Atamaning ma’nosi va yurisdiksiyalararo farqi",
    },
    audienceLabel: "Auditoriya",
    audiences: { student: "Talaba", lawyer: "Yurist", citizen: "Fuqaro", researcher: "Tadqiqotchi" },
    placeholder: {
      qa: "Huquqiy savolingizni yozing…",
      analyze: "Hujjatni yuklang, so‘ng savol bering…",
      compare: "Qiyoslamoqchi bo‘lgan mavzu (masalan: tijorat siri himoyasi)…",
      glossary: "Atamani kiriting (masalan: estoppel, uzufrukt)…",
    },
    send: "Yuborish",
    attach: "Hujjat biriktirish",
    thinking: "Manbalar qidirilmoqda va tahlil qilinmoqda…",
    error: "Xatolik yuz berdi. Qayta urinib ko‘ring.",
    newChat: "Yangi suhbat",
    sources: "Manbalar",
    exportWord: "Word",
    exportAll: "Suhbatni eksport",
    methodBtn: "Metodologiya",
    matrix: { dimension: "Mezon", uz: "O‘zbekiston", us: "AQSh", eu: "Yevropa Ittifoqi", classification: "Huquqiy tizim", synthesis: "Xulosa" },
    disclaimer: "Bu vosita ma’lumot beruvchi xususiyatga ega va malakali yuristning maslahatini almashtirmaydi. Iqtiboslarni asl manbada tekshiring.",
    welcome: {
      qa: "Salom! Huquqiy savolingizni bering — javoblar lex.uz, eur-lex va rasmiy AQSh manbalariga asoslanadi.",
      analyze: "Shartnoma yoki hujjatni (PDF/rasm) yuklang — bandlar, majburiyatlar va xatarlarni ko‘rsataman.",
      compare: "Mavzuni yozing — uni O‘zbekiston, AQSh va EI bo‘yicha jadval ko‘rinishida qiyoslayman.",
      glossary: "Huquqiy atamani kiriting — uni izohlab, common law va romano-german farqlarini ko‘rsataman.",
    },
  },
  en: {
    brand: "Lex Comparativa",
    tagline: "Source-grounded comparative legal assistant · Uzbekistan — USA — European Union",
    modes: { qa: "Q&A", analyze: "Document Analysis", compare: "Comparative Matrix", glossary: "Glossary" },
    modeDesc: {
      qa: "Source-grounded answers to legal questions",
      analyze: "Upload a contract/document for analysis",
      compare: "Compare a topic across three jurisdictions as a table",
      glossary: "Meaning of a term and cross-jurisdictional nuance",
    },
    audienceLabel: "Audience",
    audiences: { student: "Student", lawyer: "Lawyer", citizen: "Citizen", researcher: "Researcher" },
    placeholder: {
      qa: "Type your legal question…",
      analyze: "Attach a document, then ask…",
      compare: "Enter a topic to compare (e.g. trade secret protection)…",
      glossary: "Enter a term (e.g. estoppel, usufruct)…",
    },
    send: "Send",
    attach: "Attach document",
    thinking: "Searching sources and analysing…",
    error: "Something went wrong. Please try again.",
    newChat: "New chat",
    sources: "Sources",
    exportWord: "Word",
    exportAll: "Export chat",
    methodBtn: "Methodology",
    matrix: { dimension: "Dimension", uz: "Uzbekistan", us: "United States", eu: "European Union", classification: "Legal tradition", synthesis: "Synthesis" },
    disclaimer: "This tool is informational and is not a substitute for advice from a qualified lawyer. Verify citations against the primary source.",
    welcome: {
      qa: "Hello! Ask a legal question — answers are grounded in lex.uz, EUR-Lex and official US sources.",
      analyze: "Upload a contract or legal document (PDF/image) — I'll highlight clauses, obligations and risks.",
      compare: "Enter a topic — I'll compare it across Uzbek, US and EU law as a table.",
      glossary: "Enter a legal term — I'll define it and explain common-law vs. Romano-Germanic differences.",
    },
  },
  ru: {
    brand: "Lex Comparativa",
    tagline: "Сравнительно-правовой помощник на основе источников · Узбекистан — США — ЕС",
    modes: { qa: "Вопрос-ответ", analyze: "Анализ документа", compare: "Сравнительная матрица", glossary: "Глоссарий" },
    modeDesc: {
      qa: "Ответы на основе источников",
      analyze: "Загрузите договор/документ для анализа",
      compare: "Сравните тему в трёх юрисдикциях в виде таблицы",
      glossary: "Значение термина и различия между юрисдикциями",
    },
    audienceLabel: "Аудитория",
    audiences: { student: "Студент", lawyer: "Юрист", citizen: "Гражданин", researcher: "Исследователь" },
    placeholder: {
      qa: "Введите ваш юридический вопрос…",
      analyze: "Прикрепите документ, затем задайте вопрос…",
      compare: "Тема для сравнения (напр. защита коммерческой тайны)…",
      glossary: "Термин (напр. estoppel, узуфрукт)…",
    },
    send: "Отправить",
    attach: "Прикрепить документ",
    thinking: "Поиск источников и анализ…",
    error: "Произошла ошибка. Попробуйте снова.",
    newChat: "Новый чат",
    sources: "Источники",
    exportWord: "Word",
    exportAll: "Экспорт чата",
    methodBtn: "Методология",
    matrix: { dimension: "Критерий", uz: "Узбекистан", us: "США", eu: "Европейский союз", classification: "Правовая система", synthesis: "Вывод" },
    disclaimer: "Этот инструмент носит информационный характер и не заменяет консультацию юриста. Проверяйте ссылки по первоисточнику.",
    welcome: {
      qa: "Здравствуйте! Задайте вопрос — ответы опираются на lex.uz, EUR-Lex и официальные источники США.",
      analyze: "Загрузите договор или документ (PDF/изображение) — выделю положения, обязательства и риски.",
      compare: "Введите тему — сравню её в праве Узбекистана, США и ЕС в виде таблицы.",
      glossary: "Введите термин — объясню различия между common law и романо-германской системой.",
    },
  },
};

const METHODOLOGY = {
  uz: [
    ["Maqsad", "Lex Comparativa — O‘zbekiston, AQSh va Yevropa Ittifoqi huquqiy tizimlarini qiyoslab tahlil qiluvchi AI-yordamchi. U huquqiy bilimga kirishni kengaytirish va transchegaraviy qiyosiy tahlilni soddalashtirish uchun mo‘ljallangan."],
    ["Qiyosiy ramka", "Tahlil Anglo-Sakson (common law) va Romano-German (kontinental) tizimlari farqiga asoslanadi. AQSh — asosan common law; O‘zbekiston va EI a’zolarining aksariyati — romano-german an’anasi; EI huquqi esa direktiva/reglament orqali millat ustidan ishlaydi."],
    ["Manbalar", "Javoblar real vaqt rejimida rasmiy manbalardan qidiriladi: O‘zbekiston — lex.uz; Yevropa Ittifoqi — eur-lex.europa.eu; AQSh — law.cornell.edu (LII), congress.gov, govinfo.gov. Har bir javob ostida foydalanilgan manbalar havolasi ko‘rsatiladi."],
    ["Ishonchlilik", "Model aniq modda/bo‘lim raqamlarini topganda iqtibos keltiradi; aniqlik bo‘lmasa, tamoyilni umumiy bayon qilib, ⚠︎ belgisi bilan ogohlantiradi. Bu xayoliy iqtiboslar (hallyutsinatsiya) xavfini kamaytiradi."],
    ["Cheklovlar", "Bu vosita huquqiy maslahat bermaydi va advokat o‘rnini bosmaydi. Qonunchilik o‘zgaruvchan — yakuniy qaror oldidan iqtiboslarni asl manbada tekshiring."],
  ],
  en: [
    ["Purpose", "Lex Comparativa is an AI assistant for comparative analysis across the Uzbek, US and EU legal systems, built to widen access to legal knowledge and streamline cross-border comparison."],
    ["Comparative framework", "Analysis is framed by the Anglo-Saxon (common law) vs. Romano-Germanic (civil law) distinction. The US is largely common law; Uzbekistan and most EU members follow the Romano-Germanic tradition; EU law operates supranationally through regulations and directives."],
    ["Sources", "Answers are searched in real time from official sources: Uzbekistan — lex.uz; EU — eur-lex.europa.eu; US — law.cornell.edu (LII), congress.gov, govinfo.gov. Sources used appear under each answer."],
    ["Reliability", "The model cites exact article/section numbers when found; where uncertain it states the principle generally and flags it with ⚠︎, reducing the risk of fabricated citations."],
    ["Limitations", "This tool does not provide legal advice and is not a substitute for a lawyer. Law changes — verify citations against the primary source before relying on them."],
  ],
  ru: [
    ["Цель", "Lex Comparativa — ИИ-помощник для сравнительного анализа правовых систем Узбекистана, США и ЕС, созданный для расширения доступа к правовым знаниям."],
    ["Сравнительная рамка", "Анализ строится на различии англосаксонской (common law) и романо-германской систем. США — преимущественно common law; Узбекистан и большинство стран ЕС — романо-германская традиция; право ЕС действует наднационально."],
    ["Источники", "Ответы ищутся в реальном времени из официальных источников: Узбекистан — lex.uz; ЕС — eur-lex.europa.eu; США — law.cornell.edu, congress.gov, govinfo.gov. Использованные источники указываются под каждым ответом."],
    ["Надёжность", "Модель приводит точные номера статей при наличии; при неопределённости излагает принцип в общем виде и помечает ⚠︎, снижая риск вымышленных ссылок."],
    ["Ограничения", "Инструмент не даёт юридических консультаций и не заменяет юриста. Проверяйте ссылки по первоисточнику."],
  ],
};

function buildSystemPrompt(lang, mode, audience) {
  const langName = LANG_NAME[lang];
  const audienceTuning = {
    student: "The reader is a law student. Be educational: define key terms, give examples, explain reasoning step by step.",
    lawyer: "The reader is a practising lawyer. Be precise and practitioner-oriented; reference doctrines, statutory frameworks and procedure. Skip basic definitions.",
    citizen: "The reader is an ordinary citizen with no legal training. Use plain language, avoid jargon, focus on practical understanding.",
    researcher: "The reader is an academic researcher. Be analytical and rigorous; emphasise comparative depth and theoretical framing (Anglo-Saxon vs. Romano-Germanic).",
  }[audience];

  const base =
    "You are Lex Comparativa, an expert comparative-law assistant specialising in Uzbek, United States, and European Union legal systems. " +
    "Use the web_search tool to ground your answer in current, authoritative primary sources before answering. " +
    SOURCE_GUIDE + " " + audienceTuning + ` Respond in ${langName}.`;

  if (mode === "compare") {
    return (
      base +
      " The user gives a legal topic. After researching, output ONLY a JSON object (no markdown fences, no preamble, no text before or after) with EXACTLY this shape: " +
      '{"topic": string, "rows": [{"dimension": string, "uz": string, "us": string, "eu": string}], ' +
      '"classification": {"uz": string, "us": string, "eu": string}, "synthesis": string}. ' +
      "Include 4–6 rows covering at least: governing legal source (with article/section numbers where known), core principle, key practical differences, and procedural/enforcement aspects. " +
      `All string values must be written in ${langName}. Keep each cell concise (1–3 sentences). Flag uncertain points with ⚠︎.`
    );
  }
  const modeInstr = {
    qa: "Answer the legal question clearly and accurately, noting jurisdictional differences across Uzbekistan, the US and the EU where relevant.",
    analyze:
      "Analyse the uploaded legal document/contract: (1) what it is, (2) key clauses and obligations, (3) risks or unfavourable terms, (4) missing/weak provisions, (5) practical recommendations. Be structured and specific.",
    glossary:
      "Explain the legal term: (1) clear definition, (2) legal tradition of origin, (3) treatment or closest equivalent in Uzbek, US and EU law, (4) translation 'false friends'. Keep it focused on this term.",
  }[mode];
  return (
    base + " " + modeInstr +
    " Format with short paragraphs and, where helpful, headings or lists. Do not add a disclaimer paragraph; the interface shows one."
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extractSources(content) {
  const out = [];
  const seen = new Set();
  for (const block of content || []) {
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r && r.url && !seen.has(r.url)) {
          seen.add(r.url);
          out.push({ url: r.url, title: r.title || r.url });
        }
      }
    }
    if (block.type === "text" && Array.isArray(block.citations)) {
      for (const c of block.citations) {
        if (c && c.url && !seen.has(c.url)) {
          seen.add(c.url);
          out.push({ url: c.url, title: c.title || c.url });
        }
      }
    }
  }
  return out;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function proseToHtml(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const bold = escapeHtml(l).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      if (/^[-•*]\s/.test(l)) return `<li>${bold.replace(/^[-•*]\s/, "")}</li>`;
      return `<p>${bold}</p>`;
    })
    .join("");
}
function matrixToHtml(m, mt) {
  let h = `<h2>${escapeHtml(m.topic || "")}</h2><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">`;
  h += `<tr style="background:#7a2a26;color:#fff"><th>${mt.dimension}</th><th>${mt.uz}</th><th>${mt.us}</th><th>${mt.eu}</th></tr>`;
  for (const r of m.rows || []) {
    h += `<tr><td><strong>${escapeHtml(r.dimension || "")}</strong></td><td>${escapeHtml(r.uz || "")}</td><td>${escapeHtml(r.us || "")}</td><td>${escapeHtml(r.eu || "")}</td></tr>`;
  }
  h += `</table>`;
  if (m.classification) {
    h += `<p><strong>${mt.classification}:</strong> ${mt.uz}: ${escapeHtml(m.classification.uz || "")} · ${mt.us}: ${escapeHtml(m.classification.us || "")} · ${mt.eu}: ${escapeHtml(m.classification.eu || "")}</p>`;
  }
  if (m.synthesis) h += `<h3>${mt.synthesis}</h3><p>${escapeHtml(m.synthesis)}</p>`;
  return h;
}
function downloadDoc(bodyHtml, filename) {
  const html =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><style>body{font-family:Georgia,serif;color:#221c16;line-height:1.5}h1{font-size:22px}h2{color:#7a2a26}table{font-size:13px}a{color:#7a2a26}</style></head><body>" +
    bodyHtml + "</body></html>";
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [lang, setLang] = useState("uz");
  const [mode, setMode] = useState("qa");
  const [audience, setAudience] = useState("student");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const t = T[lang];

  useEffect(() => { setMessages([]); setPendingFile(null); }, [mode]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function handleSend() {
    if ((!input.trim() && !pendingFile) || loading) return;
    let apiContent;
    let displayText = input.trim();

    if (pendingFile) {
      const b64 = await fileToBase64(pendingFile);
      const isPdf = pendingFile.type === "application/pdf";
      const block = isPdf
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }
        : { type: "image", source: { type: "base64", media_type: pendingFile.type || "image/jpeg", data: b64 } };
      const fallback = lang === "ru" ? "Проанализируйте этот документ." : lang === "en" ? "Please analyse this document." : "Ushbu hujjatni tahlil qiling.";
      apiContent = [block, { type: "text", text: input.trim() || fallback }];
      displayText = (input.trim() ? input.trim() + "\n\n" : "") + "📎 " + pendingFile.name;
    } else {
      apiContent = input.trim();
    }

    const userMsg = { role: "user", display: displayText, api: apiContent };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPendingFile(null);
    setLoading(true);

    try {
      const system = buildSystemPrompt(lang, mode, audience);
      const apiMessages = next.map((m) => ({ role: m.role, content: m.api }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, messages: apiMessages }),
      });
      const data = await res.json();
      const content = data.content || [];
      const text = content.filter((i) => i.type === "text").map((i) => i.text).join("\n").trim();
      const sources = extractSources(content);

      let render;
      let apiText = text;
      if (mode === "compare") {
        const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          const m = JSON.parse(cleaned);
          if (m && Array.isArray(m.rows)) {
            render = { kind: "matrix", matrix: m };
            apiText = "[Comparative matrix on: " + (m.topic || "") + "]";
          } else render = { kind: "prose", text: text || t.error };
        } catch {
          render = { kind: "prose", text: text || t.error };
        }
      } else {
        render = { kind: "prose", text: text || t.error };
      }
      setMessages([...next, { role: "assistant", api: apiText || t.error, render, sources, mode }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", api: t.error, render: { kind: "prose", text: t.error }, sources: [], mode }]);
    } finally {
      setLoading(false);
    }
  }

  function onFilePick(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setPendingFile(f);
  }

  function exportMessage(msg) {
    const dateStr = new Date().toLocaleString();
    let body = `<h1>${t.brand}</h1><p><i>${escapeHtml(t.tagline)}</i><br/><small>${dateStr}</small></p><hr/>`;
    body += msg.render.kind === "matrix" ? matrixToHtml(msg.render.matrix, t.matrix) : proseToHtml(msg.render.text);
    if (msg.sources && msg.sources.length) {
      body += `<h3>${t.sources}</h3><ol>` + msg.sources.map((s) => `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a></li>`).join("") + "</ol>";
    }
    body += `<hr/><p style="font-size:11px;color:#666"><i>${escapeHtml(t.disclaimer)}</i></p>`;
    downloadDoc(body, "lex-comparativa.doc");
  }

  function exportAll() {
    const dateStr = new Date().toLocaleString();
    let body = `<h1>${t.brand}</h1><p><i>${escapeHtml(t.tagline)}</i><br/><small>${dateStr}</small></p><hr/>`;
    for (const m of messages) {
      if (m.role === "user") {
        body += `<p style="background:#f1e9da;padding:6px 10px"><strong>›</strong> ${escapeHtml(m.display)}</p>`;
      } else {
        body += m.render.kind === "matrix" ? matrixToHtml(m.render.matrix, t.matrix) : proseToHtml(m.render.text);
        if (m.sources && m.sources.length) {
          body += `<p style="font-size:12px"><strong>${t.sources}:</strong> ` + m.sources.map((s) => `<a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a>`).join(" · ") + "</p>";
        }
        body += "<hr/>";
      }
    }
    body += `<p style="font-size:11px;color:#666"><i>${escapeHtml(t.disclaimer)}</i></p>`;
    downloadDoc(body, "lex-comparativa-suhbat.doc");
  }

  function inline(s) {
    return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
    );
  }
  function renderProse(text) {
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} style={{ height: 6 }} />;
      if (trimmed.includes("⚠︎") || trimmed.includes("⚠")) return <div key={i} className="lc-warn">{inline(trimmed)}</div>;
      if (/^\*\*(.+)\*\*$/.test(trimmed) || /^#{1,3}\s/.test(trimmed))
        return <div key={i} className="lc-h">{trimmed.replace(/^\*\*(.+)\*\*$/, "$1").replace(/^#{1,3}\s/, "")}</div>;
      if (/^[-•*]\s/.test(trimmed))
        return <div key={i} className="lc-li"><span className="lc-dot">◦</span>{inline(trimmed.replace(/^[-•*]\s/, ""))}</div>;
      return <p key={i} className="lc-p">{inline(trimmed)}</p>;
    });
  }
  function renderMatrix(m) {
    const mt = t.matrix;
    return (
      <div className="lc-matrix">
        {m.topic && <div className="lc-matrix-topic">{m.topic}</div>}
        <div className="lc-tablewrap">
          <table className="lc-table">
            <thead>
              <tr><th>{mt.dimension}</th><th>{mt.uz}</th><th>{mt.us}</th><th>{mt.eu}</th></tr>
            </thead>
            <tbody>
              {(m.rows || []).map((r, i) => (
                <tr key={i}>
                  <td className="lc-dim">{r.dimension}</td>
                  <td>{r.uz}</td><td>{r.us}</td><td>{r.eu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {m.classification && (
          <div className="lc-class">
            <strong>{mt.classification}:</strong>{" "}
            <span className="lc-badge">{mt.uz}: {m.classification.uz}</span>
            <span className="lc-badge">{mt.us}: {m.classification.us}</span>
            <span className="lc-badge">{mt.eu}: {m.classification.eu}</span>
          </div>
        )}
        {m.synthesis && (<><div className="lc-h">{mt.synthesis}</div><p className="lc-p">{m.synthesis}</p></>)}
      </div>
    );
  }

  return (
    <div className="lc-root">
      <style>{CSS}</style>

      <header className="lc-header">
        <div className="lc-brandwrap">
          <div className="lc-mark">§</div>
          <div>
            <div className="lc-brand">{t.brand}</div>
            <div className="lc-tagline">{t.tagline}</div>
          </div>
        </div>
        <div className="lc-topright">
          <button className="lc-method-btn" onClick={() => setShowMethod(true)}>ⓘ {t.methodBtn}</button>
          <div className="lc-langs">
            {LANGS.map((l) => (
              <button key={l.id} className={"lc-lang" + (lang === l.id ? " on" : "")} onClick={() => setLang(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
      </header>

      <nav className="lc-modes">
        {Object.keys(t.modes).map((m) => (
          <button key={m} className={"lc-mode" + (mode === m ? " on" : "")} onClick={() => setMode(m)}>
            <span className="lc-mode-label">{t.modes[m]}</span>
            <span className="lc-mode-desc">{t.modeDesc[m]}</span>
          </button>
        ))}
      </nav>

      <div className="lc-controls">
        <div className="lc-aud">
          <span className="lc-aud-label">{t.audienceLabel}:</span>
          {Object.keys(t.audiences).map((a) => (
            <button key={a} className={"lc-pill" + (audience === a ? " on" : "")} onClick={() => setAudience(a)}>{t.audiences[a]}</button>
          ))}
        </div>
        {messages.length > 0 && (
          <div className="lc-ctrl-right">
            <button className="lc-new" onClick={exportAll}>⤓ {t.exportAll}</button>
            <button className="lc-new" onClick={() => { setMessages([]); setPendingFile(null); }}>↺ {t.newChat}</button>
          </div>
        )}
      </div>

      <div className="lc-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="lc-welcome">
            <div className="lc-welcome-mark">{mode === "qa" ? "?" : mode === "analyze" ? "⎙" : mode === "compare" ? "⇄" : "A"}</div>
            <p>{t.welcome[mode]}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"lc-msg " + m.role}>
            <div className="lc-avatar">{m.role === "user" ? "•" : "§"}</div>
            <div className="lc-bubble">
              {m.role === "user" ? renderProse(m.display) : (m.render.kind === "matrix" ? renderMatrix(m.render.matrix) : renderProse(m.render.text))}
              {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                <div className="lc-sources">
                  <div className="lc-sources-h">{t.sources}</div>
                  {m.sources.map((s, j) => (
                    <a key={j} className="lc-src" href={s.url} target="_blank" rel="noopener noreferrer">{j + 1}. {s.title}</a>
                  ))}
                </div>
              )}
              {m.role === "assistant" && (
                <button className="lc-export" onClick={() => exportMessage(m)}>⤓ {t.exportWord}</button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="lc-msg assistant">
            <div className="lc-avatar">§</div>
            <div className="lc-bubble lc-typing"><span></span><span></span><span></span><em>{t.thinking}</em></div>
          </div>
        )}
      </div>

      <div className="lc-inputwrap">
        {pendingFile && (
          <div className="lc-file">📎 {pendingFile.name} <button onClick={() => setPendingFile(null)}>×</button></div>
        )}
        <div className="lc-inputrow">
          {mode === "analyze" && (
            <>
              <button className="lc-attach" onClick={() => fileRef.current && fileRef.current.click()} title={t.attach}>＋</button>
              <input ref={fileRef} type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={onFilePick} />
            </>
          )}
          <textarea
            className="lc-text" rows={1} value={input} placeholder={t.placeholder[mode]}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button className="lc-send" onClick={handleSend} disabled={loading || (!input.trim() && !pendingFile)}>{t.send}</button>
        </div>
        <div className="lc-disc">{t.disclaimer}</div>
      </div>

      {showMethod && (
        <div className="lc-modal" onClick={() => setShowMethod(false)}>
          <div className="lc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lc-modal-head">
              <span>{t.methodBtn}</span>
              <button onClick={() => setShowMethod(false)}>×</button>
            </div>
            <div className="lc-modal-body">
              {METHODOLOGY[lang].map(([h, p], i) => (
                <div key={i} className="lc-method-sec">
                  <div className="lc-method-h">{h}</div>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap');
* { box-sizing: border-box; }
.lc-root {
  --bg:#f1e9da; --surface:#faf5ea; --ink:#221c16; --muted:#6f6151; --line:#ddd0ba;
  --oxblood:#7a2a26; --oxblood-d:#5e1f1c; --brass:#9c7c3c;
  font-family:'Spectral',Georgia,serif; background:var(--bg); color:var(--ink);
  height:100vh; display:flex; flex-direction:column; max-width:940px; margin:0 auto; position:relative;
}
.lc-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 20px 11px; border-bottom:2px solid var(--ink); flex-wrap:wrap; }
.lc-brandwrap { display:flex; align-items:center; gap:12px; }
.lc-mark { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; width:44px; height:44px; display:grid; place-items:center; color:var(--surface); background:var(--oxblood); border-radius:3px; }
.lc-brand { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:26px; line-height:1; letter-spacing:.5px; }
.lc-tagline { font-size:12px; color:var(--muted); margin-top:3px; font-style:italic; max-width:480px; }
.lc-topright { display:flex; align-items:center; gap:10px; }
.lc-method-btn { font-family:'Spectral',serif; font-size:12.5px; padding:5px 11px; cursor:pointer; background:transparent; border:1px solid var(--brass); color:var(--brass); border-radius:2px; }
.lc-method-btn:hover { background:var(--brass); color:#fff; }
.lc-langs { display:flex; gap:4px; }
.lc-lang { font-family:'Spectral',serif; font-size:12.5px; padding:5px 11px; cursor:pointer; background:transparent; border:1px solid var(--line); color:var(--muted); border-radius:2px; transition:all .15s; }
.lc-lang:hover { border-color:var(--brass); color:var(--ink); }
.lc-lang.on { background:var(--ink); color:var(--surface); border-color:var(--ink); }
.lc-modes { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:1px solid var(--line); background:var(--surface); }
.lc-mode { text-align:left; padding:11px 14px; cursor:pointer; background:transparent; border:none; border-right:1px solid var(--line); border-bottom:3px solid transparent; transition:all .15s; display:flex; flex-direction:column; gap:2px; }
.lc-mode:last-child { border-right:none; }
.lc-mode:hover { background:rgba(122,42,38,.05); }
.lc-mode.on { border-bottom-color:var(--oxblood); background:rgba(122,42,38,.07); }
.lc-mode-label { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:17px; color:var(--ink); }
.lc-mode.on .lc-mode-label { color:var(--oxblood); }
.lc-mode-desc { font-size:11px; color:var(--muted); line-height:1.3; }
.lc-controls { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 20px; border-bottom:1px solid var(--line); flex-wrap:wrap; }
.lc-aud { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.lc-aud-label { font-size:12.5px; color:var(--muted); font-style:italic; }
.lc-pill { font-family:'Spectral',serif; font-size:12.5px; padding:4px 10px; cursor:pointer; border:1px solid var(--line); background:var(--surface); color:var(--muted); border-radius:20px; transition:all .15s; }
.lc-pill:hover { border-color:var(--brass); }
.lc-pill.on { background:var(--brass); color:#fff; border-color:var(--brass); }
.lc-ctrl-right { display:flex; gap:6px; }
.lc-new { font-family:'Spectral',serif; font-size:12.5px; padding:4px 10px; cursor:pointer; border:1px solid var(--line); background:transparent; color:var(--muted); border-radius:2px; }
.lc-new:hover { color:var(--oxblood); border-color:var(--oxblood); }
.lc-scroll { flex:1; overflow-y:auto; padding:22px 20px; }
.lc-welcome { max-width:540px; margin:7% auto 0; text-align:center; color:var(--muted); font-size:16px; line-height:1.6; }
.lc-welcome-mark { font-family:'Cormorant Garamond',serif; font-size:40px; color:var(--oxblood); width:72px; height:72px; margin:0 auto 16px; display:grid; place-items:center; border:2px solid var(--oxblood); border-radius:50%; }
.lc-msg { display:flex; gap:12px; margin-bottom:20px; animation:fade .4s ease; }
@keyframes fade { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:none;} }
.lc-avatar { flex:none; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; margin-top:2px; }
.lc-msg.user .lc-avatar { background:var(--ink); color:var(--surface); }
.lc-msg.assistant .lc-avatar { background:var(--oxblood); color:var(--surface); }
.lc-msg.user { flex-direction:row-reverse; }
.lc-bubble { max-width:80%; padding:13px 17px; border-radius:4px; font-size:15px; line-height:1.62; position:relative; }
.lc-msg.user .lc-bubble { background:var(--ink); color:#f3ead7; border-bottom-right-radius:0; max-width:78%; }
.lc-msg.assistant .lc-bubble { background:var(--surface); border:1px solid var(--line); border-bottom-left-radius:0; }
.lc-p { margin:0 0 4px; }
.lc-h { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:18px; color:var(--oxblood); margin:10px 0 4px; }
.lc-li { display:flex; gap:8px; margin:2px 0; }
.lc-dot { color:var(--brass); flex:none; }
.lc-warn { background:#fbf3d9; border-left:3px solid var(--brass); padding:5px 10px; margin:5px 0; font-size:14px; border-radius:2px; }
.lc-matrix-topic { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:20px; color:var(--oxblood); margin-bottom:8px; }
.lc-tablewrap { overflow-x:auto; margin:4px 0 8px; border:1px solid var(--line); border-radius:3px; }
.lc-table { width:100%; border-collapse:collapse; font-size:13.5px; min-width:520px; }
.lc-table th { background:var(--oxblood); color:var(--surface); padding:8px 10px; text-align:left; font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:700; }
.lc-table td { padding:8px 10px; border-top:1px solid var(--line); vertical-align:top; line-height:1.45; }
.lc-table tr:nth-child(even) td { background:rgba(156,124,60,.05); }
.lc-dim { font-weight:600; color:var(--ink); background:rgba(122,42,38,.04)!important; white-space:nowrap; }
.lc-class { margin:6px 0; font-size:13px; }
.lc-badge { display:inline-block; background:var(--bg); border:1px solid var(--line); border-radius:20px; padding:2px 9px; margin:3px 4px 0 0; font-size:12px; }
.lc-sources { margin-top:11px; padding-top:9px; border-top:1px dashed var(--line); }
.lc-sources-h { font-size:11.5px; text-transform:uppercase; letter-spacing:.6px; color:var(--brass); margin-bottom:4px; font-weight:600; }
.lc-src { display:block; font-size:12.5px; color:var(--oxblood); text-decoration:none; padding:2px 0; line-height:1.35; }
.lc-src:hover { text-decoration:underline; }
.lc-export { margin-top:9px; font-family:'Spectral',serif; font-size:11.5px; padding:3px 9px; cursor:pointer; background:transparent; border:1px solid var(--line); color:var(--muted); border-radius:2px; }
.lc-export:hover { color:var(--oxblood); border-color:var(--oxblood); }
.lc-typing { display:flex; align-items:center; gap:5px; color:var(--muted); font-style:italic; }
.lc-typing span { width:6px; height:6px; border-radius:50%; background:var(--oxblood); display:inline-block; animation:bounce 1.1s infinite; }
.lc-typing span:nth-child(2){animation-delay:.15s;} .lc-typing span:nth-child(3){animation-delay:.3s;}
.lc-typing em { margin-left:6px; font-size:13px; }
@keyframes bounce { 0%,60%,100%{opacity:.3;} 30%{opacity:1;} }
.lc-inputwrap { border-top:2px solid var(--ink); padding:12px 20px 14px; background:var(--surface); }
.lc-file { font-size:13px; color:var(--muted); margin-bottom:8px; display:inline-flex; gap:8px; align-items:center; background:var(--bg); padding:4px 10px; border-radius:3px; border:1px solid var(--line); }
.lc-file button { border:none; background:none; cursor:pointer; color:var(--oxblood); font-size:16px; }
.lc-inputrow { display:flex; gap:8px; align-items:flex-end; }
.lc-attach { flex:none; width:42px; height:42px; border-radius:3px; cursor:pointer; font-size:22px; border:1px solid var(--line); background:var(--bg); color:var(--oxblood); }
.lc-attach:hover { border-color:var(--oxblood); }
.lc-text { flex:1; resize:none; font-family:'Spectral',serif; font-size:15px; line-height:1.5; padding:11px 14px; border:1px solid var(--line); border-radius:3px; background:var(--bg); color:var(--ink); max-height:120px; min-height:42px; }
.lc-text:focus { outline:none; border-color:var(--oxblood); }
.lc-send { flex:none; font-family:'Cormorant Garamond',serif; font-weight:700; font-size:16px; padding:0 20px; height:42px; cursor:pointer; border:none; border-radius:3px; background:var(--oxblood); color:var(--surface); letter-spacing:.3px; transition:background .15s; }
.lc-send:hover:not(:disabled) { background:var(--oxblood-d); }
.lc-send:disabled { opacity:.45; cursor:not-allowed; }
.lc-disc { font-size:11px; color:var(--muted); font-style:italic; margin-top:9px; text-align:center; }
.lc-modal { position:absolute; inset:0; background:rgba(34,28,22,.55); display:grid; place-items:center; padding:20px; z-index:30; animation:fade .2s ease; }
.lc-modal-card { background:var(--surface); max-width:560px; width:100%; max-height:82vh; overflow-y:auto; border-radius:5px; border:2px solid var(--ink); }
.lc-modal-head { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:2px solid var(--ink); font-family:'Cormorant Garamond',serif; font-weight:700; font-size:22px; color:var(--oxblood); position:sticky; top:0; background:var(--surface); }
.lc-modal-head button { border:none; background:none; font-size:26px; cursor:pointer; color:var(--muted); line-height:1; }
.lc-modal-body { padding:16px 20px 22px; }
.lc-method-sec { margin-bottom:14px; }
.lc-method-h { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:17px; color:var(--ink); margin-bottom:3px; }
.lc-method-sec p { margin:0; font-size:14px; line-height:1.6; color:var(--ink); }
@media (max-width:640px) {
  .lc-modes { grid-template-columns:repeat(2,1fr); }
  .lc-mode:nth-child(2){border-right:none;}
  .lc-mode:nth-child(1),.lc-mode:nth-child(2){border-bottom:1px solid var(--line);}
  .lc-mode-desc { display:none; }
  .lc-bubble { max-width:88%; }
  .lc-tagline { display:none; }
}
`;
