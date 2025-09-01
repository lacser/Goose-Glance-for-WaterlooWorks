import React from "react";
import { useTranslation } from "react-i18next";
import SymbolsProvider from "../symbols";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
}) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "zh-CN", name: "简体中文" },
    { code: "zh-TW", name: "繁體中文" },
    { code: "en-CA", name: "English (CA)" },
    { code: "fr-CA", name: "Français (CA)" },
  ];

  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [alignRight, setAlignRight] = React.useState(false);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setOpen(false);
  };

  const current =
    languages.find((l) => l.code === i18n.language) ?? languages[0];

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // When open, compute whether to align right to avoid overflowing the right edge of the viewport
  React.useEffect(() => {
    if (!open) return;
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportW =
        window.innerWidth || document.documentElement.clientWidth;
      const menuWidth = 240;
      const edgePadding = 8;
      const overflowRight = rect.left + menuWidth > viewportW - edgePadding;
      setAlignRight(overflowRight);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [open]);

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(
        Math.max(
          0,
          languages.findIndex((l) => l.code === i18n.language)
        )
      );
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => (idx + 1) % languages.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => (idx - 1 + languages.length) % languages.length);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const target = languages[activeIndex] ?? current;
      handleLanguageChange(target.code);
      return;
    }
  };


  return (
    <div className={className} ref={menuRef}>
      <div className="relative" ref={anchorRef}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          className={`inline-flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 text-sm font-medium text-gray-700 min-w-[180px] ${open ? "shadow-md" : "shadow-none"}`}
        >
          <SymbolsProvider
            iconSize="18px"
            weight={500}
            classname="text-gray-500"
          >
            language
          </SymbolsProvider>
          <span className="truncate text-gray-800">{current.name}</span>
          <span className="ml-auto inline-flex items-center">
            <SymbolsProvider
              iconSize="18px"
              weight={400}
              classname={`transform transition-transform duration-200 ${
                open ? "rotate-180" : ""
              } text-gray-500`}
            >
              expand_more
            </SymbolsProvider>
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={`absolute top-full mt-2 w-60 ${
              alignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"
            } rounded-xl bg-white/95 backdrop-blur shadow-2xl ring-1 ring-black/5 p-1 z-50 animate-in fade-in zoom-in-95`}
          >
            {languages.map((lang, idx) => {
              const selected = i18n.language === lang.code;
              const active = idx === activeIndex;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <SymbolsProvider
                    iconSize="18px"
                    classname={active ? "text-blue-600" : "text-gray-400"}
                  >
                    translate
                  </SymbolsProvider>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{lang.name}</div>
                    <div className="text-xs text-gray-400">{lang.code}</div>
                  </div>
                  {selected && (
                    <SymbolsProvider
                      iconSize="18px"
                      classname="text-emerald-500"
                    >
                      check
                    </SymbolsProvider>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
