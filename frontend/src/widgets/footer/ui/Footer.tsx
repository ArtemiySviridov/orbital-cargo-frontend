import "./Footer.scss";

const sections=[
  {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Карьера", href: "/careers" },
    ],
  },
  {
    title: "Услуги",
    links: [
      { label: "Запуск грузов", href: "/launch" },
      { label: "Орбитальная доставка", href: "/delivery" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { label: "Контакты", href: "/contacts" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Юридическое",
    links: [
      { label: "Политика", href: "/privacy" },
      { label: "Условия", href: "/terms" },
    ],
  },
]

const Footer = () => {
    return (
      <footer className="footer">
        <div className="footer__container">

          <div className="footer__top">
            <div className="footer__brand">
              <h2 className="footer__logo">Orbital Cargo</h2>
              <p className="footer__tagline">
                Доставка грузов на орбиту и за её пределы
              </p>
            </div>

            <div className="footer__sections">
              {sections.map((section, i) => (
                <div key={i} className="footer__section">
                  <h4 className="footer__title">{section.title}</h4>

                  {section.links.map((link, idx) => (
                    <a key={idx} className="footer__link">
                      {link.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Orbital Cargo</span>
          </div>

        </div>
      </footer>
  );
};

export default Footer;