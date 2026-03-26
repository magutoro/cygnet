const translations = {
  en: {
    page_title: "Cygnet autofill made easy",
    badge: "Chrome Extension",
    title: "Cygnet autofill made easy",
    subtitle: "Autofill Japanese job application forms with your saved profile.",
    download_title: "Download Extension",
    download_desc: "Download the latest package and load it in Chrome extensions.",
    download_btn: "Download .zip",
    privacy_title: "Privacy",
    privacy_desc: "Read how Cygnet handles profile data, storage, and user controls.",
    privacy_open: "Read privacy policy",
    demo_title: "Setup Demo",
    demo_open: "Open demo in new tab",
    steps_title: "Step by Step",
    step_1: "Download and unzip the extension package.",
    step_2: "Open chrome://extensions in Chrome.",
    step_3: "Enable Developer mode.",
    step_4: "Click Load unpacked and select the extracted folder.",
    step_5: "Open profile settings in the extension and save your info.",
    step_6: "Open a job form and run autofill from the popup."
  },
  ja: {
    page_title: "Cygnet 自動入力をもっと簡単に",
    badge: "Chrome拡張機能",
    title: "Cygnet 自動入力をもっと簡単に",
    subtitle: "保存したプロフィール情報で、日本の求人応募フォームを自動入力します。",
    download_title: "拡張機能をダウンロード",
    download_desc: "最新のパッケージを取得して、Chrome拡張機能として読み込みます。",
    download_btn: ".zipをダウンロード",
    privacy_title: "プライバシー",
    privacy_desc: "Cygnetがプロフィール情報をどのように保存・利用・管理するかを確認できます。",
    privacy_open: "プライバシーポリシーを見る",
    demo_title: "セットアップデモ",
    demo_open: "新しいタブでデモを開く",
    steps_title: "手順ガイド",
    step_1: "拡張機能のzipをダウンロードして解凍します。",
    step_2: "Chromeで chrome://extensions を開きます。",
    step_3: "Developer mode をONにします。",
    step_4: "Load unpacked を押して、解凍したフォルダを選択します。",
    step_5: "拡張機能のプロフィール設定で情報を保存します。",
    step_6: "応募フォームを開き、ポップアップから自動入力を実行します。"
  }
};

const SUPPORTED = ["en", "ja"];
const STORAGE_KEY = "cygnet_lang";

function detectLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED.includes(saved)) return saved;

  const browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  return browserLang.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function applyLanguage(lang) {
  const safeLang = SUPPORTED.includes(lang) ? lang : "en";
  const dict = translations[safeLang];

  document.documentElement.lang = safeLang;
  document.title = dict.page_title;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (dict[key]) node.textContent = dict[key];
  });

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang-btn") === safeLang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  localStorage.setItem(STORAGE_KEY, safeLang);
}

document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang-btn")));
});

applyLanguage(detectLanguage());
