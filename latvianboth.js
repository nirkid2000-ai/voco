const data = {
  words: [
    { ans: { en: "table", he: "שולחן" }, q: "galds", level: "A1" },
    { ans: { en: "chair", he: "כיסא" }, q: "krēsls", level: "A1" },
    { ans: { en: "window", he: "חלון" }, q: "logs", level: "A1" },
    { ans: { en: "door", he: "דלת" }, q: "durvis", level: "A1" },
    { ans: { en: "room", he: "חדר" }, q: "istaba", level: "A1" },
    { ans: { en: "kitchen", he: "מטבח" }, q: "virtuve", level: "A1" },
    {
      ans: { en: "bathroom", he: "חדר רחצה" },
      q: "vannas istaba",
      level: "A1",
    },
    { ans: { en: "bed", he: "מיטה" }, q: "gulta", level: "A1" },
    { ans: { en: "phone", he: "טלפון" }, q: "telefons", level: "A1" },
    { ans: { en: "computer", he: "מחשב" }, q: "dators", level: "A1" },

    { ans: { en: "shirt", he: "חולצה" }, q: "krekls", level: "A1" },
    { ans: { en: "pants", he: "מכנסיים" }, q: "bikses", level: "A1" },
    { ans: { en: "shoes", he: "נעליים" }, q: "kurpes", level: "A1" },
    { ans: { en: "hat", he: "כובע" }, q: "cepure", level: "A1" },
    { ans: { en: "coat", he: "מעיל" }, q: "mētelis", level: "A1" },

    { ans: { en: "coffee", he: "קפה" }, q: "kafija", level: "A1" },
    { ans: { en: "tea", he: "תה" }, q: "tēja", level: "A1" },
    { ans: { en: "juice", he: "מיץ" }, q: "sula", level: "A1" },
    { ans: { en: "soup", he: "מרק" }, q: "zupa", level: "A1" },
    { ans: { en: "meat", he: "בשר" }, q: "gaļa", level: "A1" },

    { ans: { en: "market", he: "שוק" }, q: "tirgus", level: "A1" },
    { ans: { en: "shop", he: "חנות" }, q: "veikals", level: "A1" },
    { ans: { en: "park", he: "פארק" }, q: "parks", level: "A1" },
    { ans: { en: "station", he: "תחנה" }, q: "stacija", level: "A1" },
    { ans: { en: "airport", he: "שדה תעופה" }, q: "lidosta", level: "A1" },

    { ans: { en: "job", he: "עבודה" }, q: "darbs", level: "A1" },
    { ans: { en: "boss", he: "בוס" }, q: "priekšnieks", level: "A1" },
    { ans: { en: "money", he: "כסף" }, q: "nauda", level: "A1" },
    { ans: { en: "price", he: "מחיר" }, q: "cena", level: "A1" },
    { ans: { en: "ticket", he: "כרטיס" }, q: "biļete", level: "A1" },

    { ans: { en: "left", he: "שמאל" }, q: "pa kreisi", level: "A1" },
    { ans: { en: "right", he: "ימין" }, q: "pa labi", level: "A1" },
    { ans: { en: "straight", he: "ישר" }, q: "taisni", level: "A1" },
    { ans: { en: "near", he: "קרוב" }, q: "tuvu", level: "A1" },
    { ans: { en: "far", he: "רחוק" }, q: "tālu", level: "A1" },

    { ans: { en: "always", he: "תמיד" }, q: "vienmēr", level: "A1" },
    { ans: { en: "often", he: "לעיתים קרובות" }, q: "bieži", level: "A1" },
    { ans: { en: "sometimes", he: "לפעמים" }, q: "dažreiz", level: "A1" },
    { ans: { en: "never", he: "לעולם לא" }, q: "nekad", level: "A1" },

    { ans: { en: "early", he: "מוקדם" }, q: "agri", level: "A1" },
    { ans: { en: "late", he: "מאוחר" }, q: "vēlu", level: "A1" },

    { ans: { en: "clean", he: "נקי" }, q: "tīrs", level: "A1" },
    { ans: { en: "dirty", he: "מלוכלך" }, q: "netīrs", level: "A1" },
    { ans: { en: "easy", he: "קל" }, q: "viegli", level: "A1" },
    { ans: { en: "difficult", he: "קשה" }, q: "grūti", level: "A1" },

    { ans: { en: "open (adj)", he: "פתוח" }, q: "atvērts", level: "A1" },
    { ans: { en: "closed (adj)", he: "סגור" }, q: "aizvērts", level: "A1" },

    { ans: { en: "start", he: "להתחיל" }, q: "sākt", level: "A1" },
    { ans: { en: "finish", he: "לסיים" }, q: "pabeigt", level: "A1" },
    { ans: { en: "wait", he: "לחכות" }, q: "gaidīt", level: "A1" },
    { ans: { en: "watch", he: "לצפות" }, q: "skatīties", level: "A1" },
    { ans: { en: "listen", he: "להקשיב" }, q: "klausīties", level: "A1" },

    { ans: { en: "open (verb)", he: "לפתוח" }, q: "atvērt", level: "A1" },
    { ans: { en: "close (verb)", he: "לסגור" }, q: "aizvērt", level: "A1" },

    { ans: { en: "call", he: "להתקשר" }, q: "zvanīt", level: "A1" },
    { ans: { en: "answer", he: "לענות" }, q: "atbildēt", level: "A1" },
    { ans: { en: "ask", he: "לשאול" }, q: "jautāt", level: "A1" },

    { ans: { en: "travel", he: "לטייל" }, q: "ceļot", level: "A1" },
    { ans: { en: "arrive", he: "להגיע" }, q: "ierasties", level: "A1" },
    { ans: { en: "leave", he: "לעזוב" }, q: "aiziet", level: "A1" },

    { ans: { en: "carry", he: "לשאת" }, q: "nest", level: "A1" },
    { ans: { en: "open up", he: "להיפתח" }, q: "atvērties", level: "A1" },
    { ans: { en: "close up", he: "להיסגר" }, q: "aizvērties", level: "A1" },

    { ans: { en: "smile", he: "לחייך" }, q: "smaidīt", level: "A1" },
    { ans: { en: "laugh", he: "לצחוק" }, q: "smieties", level: "A1" },
    { ans: { en: "cry", he: "לבכות" }, q: "raudāt", level: "A1" },

    { ans: { en: "meet", he: "לפגוש" }, q: "satikt", level: "A1" },
    { ans: { en: "visit", he: "לבקר" }, q: "apmeklēt", level: "A1" },
    { ans: { en: "stay", he: "להישאר" }, q: "palikt", level: "A1" },
  ],
};

export default data;
