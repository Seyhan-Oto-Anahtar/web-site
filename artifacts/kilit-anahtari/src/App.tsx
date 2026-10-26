import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import {
  ArrowDownRight, ArrowRight, Check, ChevronDown, Clock3, KeyRound, LockKeyhole,
  MapPin, Menu, MessageCircle, Phone, ShieldCheck, Wrench, X, CarFront, DoorOpen,
  CircleHelp, ClipboardCheck, KeySquare, Building2, BadgeInfo, Send, Home as HomeIcon,
} from 'lucide-react';
import { businessConfig } from './business-config';

const queryClient = new QueryClient();

type PageKey = 'home' | 'services' | 'automotive' | 'locksmith' | 'replacement' | 'contact' | 'privacy';
const pageMeta: Record<PageKey, { title: string; description: string; heading: string; eyebrow: string }> = {
  home: { title: 'Çilingir ve Oto Anahtar Hizmetleri | Anahtar & Kilit', description: 'Konut, iş yeri ve araç anahtarı sorunlarınız için çilingir ve oto anahtar hizmetlerini inceleyin. İhtiyacınıza uygun bilgi ve iletişim seçenekleri.', heading: 'Anahtarınız mı kayıp, kapıda mı kaldınız?', eyebrow: 'ÇİLİNGİR · OTO ANAHTAR · KİLİT SİSTEMLERİ' },
  services: { title: 'Çilingir ve Anahtarcı Hizmetleri | Hizmetler', description: 'Kapı açma, kilit ve barel değişimi, araç anahtarı, kumanda ve immobilizer hizmetlerini tek yerde keşfedin.', heading: 'İhtiyacınıza uygun hizmeti bulun', eyebrow: 'HİZMETLER' },
  automotive: { title: 'Oto Çilingir ve Araç Anahtarı Hizmetleri', description: 'Araç anahtarı çoğaltma, kumanda, immobilizer ve kayıp anahtar çözümleri hakkında bilgi alın ve iletişim kurun.', heading: 'Araç anahtarında doğru çözüm, net bilgiyle başlar', eyebrow: 'OTO ÇİLİNGİR' },
  locksmith: { title: 'Konut ve İş Yeri Çilingir Hizmetleri', description: 'Konut, apartman ve iş yeri kapıları için açma, kilit onarımı ve montaj hizmetlerini inceleyin.', heading: 'Kapı ve kilit sorunları için profesyonel destek', eyebrow: 'KONUT · İŞ YERİ' },
  replacement: { title: 'Kilit ve Barel Değişimi | Anahtar & Kilit', description: 'Kapı kilidi ve barel değişimi, arıza kontrolü ve yeni kilit montajı hakkında bilgi alın.', heading: 'Kilit değişimi, ihtiyaca göre planlanır', eyebrow: 'KİLİT SİSTEMLERİ' },
  contact: { title: 'İletişim ve Hizmet Talebi | Anahtar & Kilit', description: 'Hizmet ihtiyacınızı kısaca aktarın. Gerçek iletişim bilgileri yapılandırıldığında telefon ve WhatsApp seçenekleri burada görünür.', heading: 'Sorununuzu anlatın, birlikte netleştirelim', eyebrow: 'İLETİŞİM' },
  privacy: { title: 'Gizlilik ve Kişisel Verilerin Korunması', description: 'Bu web sitesinde iletişim formu verilerinin nasıl işlendiği ve iletişim seçenekleri hakkında gizlilik bilgilendirmesi.', heading: 'Gizlilik bildirimi', eyebrow: 'GİZLİLİK' },
};

const navItems: { href: string; label: string }[] = [
  { href: '/', label: 'Ana sayfa' },
  { href: '/services', label: 'Hizmetler' },
  { href: '/automotive-locksmith', label: 'Oto çilingir' },
  { href: '/locksmith', label: 'Konut ve iş yeri' },
  { href: '/lock-replacement', label: 'Kilit değişimi' },
  { href: '/contact', label: 'İletişim' },
  { href: '/privacy-policy', label: 'Gizlilik' },
];

type ContactKind = 'phone' | 'whatsapp' | 'directions';

function contactTarget(value: string, kind: ContactKind) {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned) return undefined;
  if (kind === 'phone') return `tel:${cleaned}`;
  if (kind === 'whatsapp') return `https://wa.me/${cleaned.replace(/\D/g, '')}`;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function ContactLink({ kind, compact = false }: { kind: ContactKind; compact?: boolean }) {
  const value = kind === 'phone' ? businessConfig.phone : kind === 'whatsapp' ? businessConfig.whatsapp : businessConfig.directionsUrl;
  const href = contactTarget(value, kind);
  const label = kind === 'phone' ? 'Telefonla iletişim' : kind === 'whatsapp' ? 'WhatsApp ile iletişim' : 'Yol tarifi';
  const Icon = kind === 'phone' ? Phone : kind === 'whatsapp' ? MessageCircle : MapPin;
  const fallbackLabel = kind === 'phone' ? 'Tel. eksik' : kind === 'whatsapp' ? 'WA eksik' : 'Konum eksik';
  const linkClass = compact ? `contact-small contact-small-${kind}` : 'button-outline';
  const text = compact
    ? (href ? (kind === 'phone' ? 'Ara' : kind === 'whatsapp' ? 'WhatsApp' : 'Yol tarifi') : fallbackLabel)
    : (href ? (kind === 'phone' ? 'Telefonla arayın' : kind === 'whatsapp' ? 'WhatsApp ile yazın' : 'Yol tarifi al') : `${kind === 'phone' ? 'Telefon' : kind === 'whatsapp' ? 'WhatsApp' : 'Konum'} bilgisi gerekli`);
  if (!href) return <Link href="/contact" data-testid={`link-contact-${kind}`} className={linkClass} aria-label={`${label}: bilgi henüz eklenmedi`} title="İşletme bilgileri henüz eklenmedi"><Icon size={16} />{text}</Link>;
  return <a href={href} target={kind === 'phone' ? undefined : '_blank'} rel={kind === 'phone' ? undefined : 'noopener noreferrer'} aria-label={label} data-testid={`link-${kind}`} className={linkClass}><Icon size={16} />{text}</a>;
}

function Brand() {
  return <Link href="/" className="brand" aria-label="Anahtar ve Kilit ana sayfa" data-testid="link-brand"><span className="brand-mark"><KeyRound size={21} strokeWidth={2.1} /></span><span className="brand-name">anahtar<span>&</span>kilit<small>ÇİLİNGİR · OTO ANAHTAR</small></span></Link>;
}

function Header() {
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  return <>
    <div className="topline"><div className="container-wide top-line-inner"><span><span className="top-dot" />Çilingir ve oto anahtar hizmetleri</span><span className="top-note">Bilgi alın, seçeneklerinizi değerlendirin</span><Link href="/contact" className="top-contact">İletişime geçin <ArrowRight size={13} /></Link></div></div>
    <header className="site-header"><div className="container-wide nav-inner">
      <Brand />
      <nav className={`main-nav ${open ? 'nav-open' : ''}`} aria-label="Ana gezinme">
        {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={path === item.href ? 'page' : undefined} className="nav-link" onClick={() => setOpen(false)} data-testid={`nav-${item.href.replaceAll('/', '') || 'home'}`}>{item.label}</Link>)}
      </nav>
      <div className="nav-actions"><ContactLink kind="phone" compact /><Link href="/contact" className="nav-cta" data-testid="link-header-contact"><Phone size={15} /> İletişim</Link></div>
      <button type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} data-testid="button-mobile-menu">{open ? <X /> : <Menu />}</button>
    </div></header>
  </>;
}

function Footer() {
  return <footer className="site-footer"><div className="container-wide footer-main">
    <div className="footer-brand-col"><Brand /><p>Konut, iş yeri ve araç anahtarı ihtiyaçlarınız için hizmet seçeneklerini inceleyin. Kapsam ve ücret bilgisi, talebiniz değerlendirilerek paylaşılır.</p><div className="footer-contacts"><ContactLink kind="phone" /><ContactLink kind="whatsapp" /></div></div>
    <div className="footer-col"><h2>Hizmetler</h2><Link href="/services">Tüm hizmetler</Link><Link href="/automotive-locksmith">Oto çilingir</Link><Link href="/locksmith">Konut ve iş yeri</Link><Link href="/lock-replacement">Kilit ve barel değişimi</Link></div>
    <div className="footer-col"><h2>Bilgi</h2><Link href="/contact">İletişim</Link><Link href="/privacy-policy">Gizlilik bildirimi</Link><p className="footer-address">{businessConfig.address || 'İşletme adresi henüz eklenmedi.'}</p></div>
  </div><div className="container-wide footer-bottom"><span>© {new Date().getFullYear()} {businessConfig.name || 'Anahtar & Kilit'} · Tüm hakları saklıdır.</span><span>İhtiyacınızı anlayan, net iletişim.</span></div></footer>;
}

function MobileContact() {
  return <div className="mobile-contact" aria-label="Hızlı iletişim"><ContactLink kind="phone" compact /><ContactLink kind="whatsapp" compact /><ContactLink kind="directions" compact /></div>;
}

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`image-fallback ${className || ''}`} role="img" aria-label={alt}><KeyRound size={44} /><span>Görsel yüklenemedi</span></div> : <img className={className} src={src} alt={alt} width="900" height="650" loading="lazy" onError={() => setFailed(true)} />;
}

function SectionLabel({ children }: { children: ReactNode }) { return <div className="section-label"><span />{children}</div>; }
function Breadcrumb({ current }: { current: string }) { return <nav className="breadcrumb container-wide" aria-label="İçerik yolu"><Link href="/">Ana sayfa</Link><span>/</span><span aria-current="page">{current}</span></nav>; }

const serviceItems = [
  { title: 'Acil çilingir desteği', text: 'Kapıda kalma gibi durumlarda ihtiyacınızı ve uygun hizmet seçeneğini birlikte değerlendirelim.', icon: DoorOpen, href: '/locksmith', category: 'Konut & iş yeri' },
  { title: 'Konut ve apartman kapıları', text: 'Kapı açma, mekanizma kontrolü ve kilit sistemleri için seçenekleri öğrenin.', icon: HomeIcon, href: '/locksmith', category: 'Konut & iş yeri' },
  { title: 'Çelik kapı kilit hizmetleri', text: 'Çelik kapı kilitleri ve mekanizmaları için arıza tespiti ve hizmet bilgisi.', icon: ShieldCheck, href: '/locksmith', category: 'Konut & iş yeri' },
  { title: 'Kilit ve barel değişimi', text: 'Mevcut kilidin durumuna göre değişim veya onarım seçeneklerini değerlendirin.', icon: LockKeyhole, href: '/lock-replacement', category: 'Kilit sistemleri' },
  { title: 'Araç anahtarı', text: 'Anahtar çoğaltma ve kayıp araç anahtarları için bilgi alın.', icon: CarFront, href: '/automotive-locksmith', category: 'Otomotiv' },
  { title: 'Kumanda ve akıllı anahtar', text: 'Uzaktan kumanda ve akıllı anahtar hizmetlerinin kapsamını öğrenin.', icon: KeySquare, href: '/automotive-locksmith', category: 'Otomotiv' },
  { title: 'İmmobilizer ve programlama', text: 'Araç anahtarı ve immobilizer eşleştirmesiyle ilgili seçenekleri konuşun.', icon: Wrench, href: '/automotive-locksmith', category: 'Otomotiv' },
  { title: 'Kasa ve dolap kilitleri', text: 'Kasa ve dolap kilitleri için durumunuza uygun servis bilgisi alın.', icon: Building2, href: '/services', category: 'Diğer kilitler' },
];

function ServiceCards({ limit }: { limit?: number }) {
  return <div className="service-grid">{serviceItems.slice(0, limit).map((item, i) => { const Icon = item.icon; return <article className="service-card" key={item.title} data-testid={`card-service-${i}`}><div className="service-card-top"><span className="service-icon"><Icon size={21} /></span><span className="service-category">{item.category}</span></div><h3>{item.title}</h3><p>{item.text}</p><Link href={item.href} className="text-link">Hizmet ayrıntıları <ArrowRight size={15} /></Link></article>; })}</div>;
}

const faqItems = [
  ['Bir çilingire nasıl ulaşabilirim?', 'Telefon veya WhatsApp bilgileri işletme yapılandırmasına eklendiğinde doğrudan iletişim seçenekleri açılır. Bu bilgiler henüz girilmemişse iletişim sayfasındaki formu kullanarak ihtiyacınızı iletebilirsiniz. Form şu anda gerçek bir servise gönderim yapmaz.'],
  ['Araç anahtarı çoğaltma hizmeti var mı?', 'Araç marka ve modeline, anahtar türüne ve mevcut anahtar durumuna göre hizmet kapsamı değişebilir. Aracınızla ilgili bilgileri paylaşarak uygun seçeneği öğrenebilirsiniz.'],
  ['Araç anahtarımı kaybettiysem ne yapmalıyım?', 'Aracın marka-model ve yıl bilgisini, anahtarın tamamen kayıp olup olmadığını belirtin. Bu bilgiler uygun işlem ve olası ücret hakkında ön değerlendirmeye yardımcı olur.'],
  ['Kapı kilidi veya barel değişimi yapılabilir mi?', 'Evet, kilit ve barel değişimi hizmetleri sunulmaktadır. Mevcut kilit ve kapı tipi değerlendirilerek uygun seçenek paylaşılır.'],
  ['Hizmet ücreti nasıl belirlenir?', 'Ücret; hizmet türü, kilit veya anahtar sistemi ve işlem koşullarına göre değişebilir. İşlem öncesinde kapsam ve ücret bilgisini teyit etmenizi öneririz.'],
  ['Hangi bölgelerde hizmet veriliyor?', 'Hizmet bölgeleri henüz işletme tarafından yapılandırılmadı. Güncel bölge bilgisi için iletişim sayfasından bilgi isteyin.'],
  ['Gece acil çilingir hizmeti var mı?', 'Çalışma saatleri ve gece hizmeti bilgileri henüz doğrulanmadı. Ulaşılabilirlik durumunu doğrudan teyit edin.'],
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="faq-list">{faqItems.map(([q, a], index) => <div key={q} className={`faq-item ${open === index ? 'faq-active' : ''}`}><h3><button type="button" aria-expanded={open === index} aria-controls={`faq-panel-${index}`} onClick={() => setOpen(open === index ? null : index)} data-testid={`button-faq-${index}`}>{q}<ChevronDown size={19} /></button></h3>{open === index && <div id={`faq-panel-${index}`} className="faq-answer">{a}</div>}</div>)}</div>;
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })); setSuccess(false); };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Lütfen adınızı en az 2 karakterle yazın.';
    if (!/^[+]?[\d\s()\-]{7,20}$/.test(form.phone.trim())) next.phone = 'Geçerli bir telefon numarası girin.';
    if (!form.service) next.service = 'Lütfen bir hizmet başlığı seçin.';
    if (form.message.trim().length < 10) next.message = 'Mesajınızı en az 10 karakterle açıklayın.';
    setErrors(next);
    if (Object.keys(next).length === 0) setSuccess(true);
  }
  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="form-heading"><div><SectionLabel>HİZMET TALEBİ</SectionLabel><h2>İhtiyacınızı paylaşın</h2></div><span className="form-note">* Zorunlu alanlar</span></div>
    <div className="form-grid">
      <label>Adınız soyadınız <span>*</span><input data-testid="input-name" value={form.name} onChange={e => update('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} placeholder="Adınız soyadınız" />{errors.name && <small id="error-name" className="field-error">{errors.name}</small>}</label>
      <label>Telefon numaranız <span>*</span><input data-testid="input-phone" value={form.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'error-phone' : undefined} placeholder="05__ ___ __ __" />{errors.phone && <small id="error-phone" className="field-error">{errors.phone}</small>}</label>
      <label className="form-full">Hangi konuda destek arıyorsunuz? <span>*</span><select data-testid="select-service" value={form.service} onChange={e => update('service', e.target.value)} aria-invalid={!!errors.service} aria-describedby={errors.service ? 'error-service' : undefined}><option value="">Bir hizmet seçin</option><option>Konut veya iş yeri kapısı</option><option>Kilit veya barel değişimi</option><option>Araç anahtarı</option><option>Kumanda veya immobilizer</option><option>Diğer</option></select>{errors.service && <small id="error-service" className="field-error">{errors.service}</small>}</label>
      <label className="form-full">Mesajınız <span>*</span><textarea data-testid="input-message" value={form.message} onChange={e => update('message', e.target.value)} rows={4} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'error-message' : undefined} placeholder="Durumu ve varsa önemli ayrıntıları kısaca yazın." />{errors.message && <small id="error-message" className="field-error">{errors.message}</small>}</label>
    </div>
    <div className="form-submit-row"><button className="button-primary form-submit" type="submit" data-testid="button-submit-contact">Bilgileri gözden geçir <ArrowRight size={16} /></button><p>Bu form örnek bir arayüzdür; mesajınız bir işletmeye gönderilmez.</p></div>
    {success && <div className="form-success" role="status" aria-live="polite"><span><Check size={18} /></span><div><strong>Bilgileriniz kontrol edildi.</strong><p>Mesajınız gönderilmedi. Bu sitede henüz gerçek bir form gönderim servisi bulunmuyor. İletişime geçmek için yapılandırılmış telefon veya WhatsApp seçeneğini kullanın.</p><Link href="/contact" className="text-link">İletişim seçeneklerini görüntüle <ArrowRight size={15} /></Link></div></div>}
  </form>;
}

function CTA({ title = 'İhtiyacınızı birlikte değerlendirelim', text = 'Hizmet kapsamı ve ücret bilgisi için durumunuzu kısaca paylaşın.' }: { title?: string; text?: string }) {
  return <section className="cta-band"><div className="cta-copy"><SectionLabel>İLETİŞİM</SectionLabel><h2>{title}</h2><p>{text}</p></div><div className="cta-actions"><ContactLink kind="phone" /><Link href="/contact" className="button-light" data-testid="link-cta-contact">İletişim sayfası <ArrowRight size={16} /></Link></div></section>;
}

function HomePage() {
  return <main>
    <section className="hero hero-backdrop"><div className="container-wide hero-layout"><div className="hero-copy reveal"><SectionLabel>{pageMeta.home.eyebrow}</SectionLabel><h1 className="display-font">Anahtarınız mı kayıp,<br /><em>kapıda mı kaldınız?</em></h1><p className="hero-lead">Konut, iş yeri ve araçlar için çilingir hizmet seçeneklerini inceleyin. İhtiyacınızı anlatın; uygun hizmet ve ücret bilgisini sorun.</p><div className="hero-actions"><ContactLink kind="phone" /><Link href="/contact" className="button-primary" data-testid="link-hero-contact"><MessageCircle size={17} /> İletişim seçenekleri</Link></div><div className="hero-footnote"><span className="footnote-mark"><ShieldCheck size={16} /></span> Önce ihtiyacınızı anlayalım, sonra seçenekleri konuşalım.</div></div>
      <div className="hero-visual reveal"><div className="hero-image-wrap"><ImageWithFallback src="/locksmith-hero.jpg" alt="Bir çilingir ustası çalışma tezgâhında araç anahtarını programlarken" className="hero-image" /></div><div className="image-caption"><span className="caption-index">01 / 03</span><span>İşinize uygun çözüm<br /><strong>net bilgiyle başlar.</strong></span><ArrowDownRight size={19} /></div><div className="hero-orbit" aria-hidden="true"><KeyRound size={25} /></div></div>
    </div></section>
    <div className="trust-strip"><div className="container-wide trust-items"><div><LockKeyhole /><span><b>Konut ve iş yeri</b><small>Kapı ve kilit sistemleri</small></span></div><div><CarFront /><span><b>Oto anahtar</b><small>Anahtar, kumanda, immobilizer</small></span></div><div><Wrench /><span><b>Uygun ekipman</b><small>İşleme göre değerlendirme</small></span></div><div><BadgeInfo /><span><b>Açık iletişim</b><small>Kapsam ve ücret bilgisi</small></span></div></div></div>
    <section className="section section-services"><div className="container-wide"><div className="section-head"><div><SectionLabel>HİZMETLERİMİZ</SectionLabel><h2 className="display-font">Ne konuda desteğe<br /><em>ihtiyacınız var?</em></h2></div><p>Kilit, kapı veya araç anahtarı. İlgili hizmet sayfasından kapsamı inceleyin ve nasıl iletişime geçeceğinizi öğrenin.</p></div><ServiceCards limit={4} /><div className="section-end"><Link href="/services" className="text-link">Tüm hizmetleri inceleyin <ArrowRight size={16} /></Link></div></div></section>
    <section className="split-feature automotive-feature"><div className="container-wide split-layout"><div className="feature-image-frame"><ImageWithFallback src="/car-keys.jpg" alt="Araç iç mekânında farklı tiplerde modern araç anahtarları" className="feature-image" /><span className="image-stamp">OTO ANAHTAR<br />HİZMETLERİ</span></div><div className="feature-copy"><SectionLabel>OTOMOTİV</SectionLabel><h2 className="display-font">Araç anahtarı ve kumanda <em>çözümleri</em></h2><p>Anahtar çoğaltma, kayıp anahtar, kumanda arızası ve immobilizer sistemleri için aracınıza uygun hizmet bilgisini alın.</p><ul className="check-list"><li><Check size={16} /> Anahtar çoğaltma ve kayıp anahtar</li><li><Check size={16} /> Kumanda ve akıllı anahtar hizmetleri</li><li><Check size={16} /> İmmobilizer hakkında ön değerlendirme</li></ul><Link href="/automotive-locksmith" className="button-primary">Oto çilingir hizmetleri <ArrowRight size={16} /></Link></div></div></section>
    <section className="split-feature residential-feature"><div className="container-wide split-layout split-reverse"><div className="feature-copy"><SectionLabel>KONUT · TİCARİ</SectionLabel><h2 className="display-font">Kapı ve kilit sorunlarında <em>uygun seçenek</em></h2><p>Apartman, konut ve iş yeri kapılarında açma, mekanizma onarımı ve kilit değişimi seçeneklerini öğrenin.</p><ul className="check-list"><li><Check size={16} /> Kapı açma ve kilit mekanizması</li><li><Check size={16} /> Çelik kapı kilit hizmetleri</li><li><Check size={16} /> Barel değişimi ve yeni kilit montajı</li></ul><Link href="/locksmith" className="button-primary">Çilingir hizmetlerini inceleyin <ArrowRight size={16} /></Link></div><div className="feature-image-frame"><ImageWithFallback src="/lock-cylinder.jpg" alt="Kapı kilidi barelini kontrol eden çilingir ustasının elleri" className="feature-image" /><span className="image-stamp">KİLİT SİSTEMLERİ<br />KONUT · İŞ YERİ</span></div></div></section>
    <section className="process-section"><div className="container-wide"><div className="section-head process-head"><div><SectionLabel>NASIL İLERLER?</SectionLabel><h2 className="display-font">Önce netlik,<br /><em>sonra hizmet.</em></h2></div><p>İlk görüşmede paylaşacağınız birkaç ayrıntı doğru hizmeti ve beklentileri netleştirmeye yardımcı olur.</p></div><div className="process-grid"><article><span className="process-no">01</span><h3>İhtiyacınızı anlatın</h3><p>Kapı veya araç bilgisiyle sorunun ne zaman başladığını paylaşın.</p></article><article><span className="process-no">02</span><h3>Seçenekleri konuşun</h3><p>Duruma göre hizmet kapsamı ve mümkünse tahmini ücret bilgisi alın.</p></article><article><span className="process-no">03</span><h3>Bilgiyi teyit edin</h3><p>İşleme başlamadan önce ücret, uygunluk ve varsa süre bilgisini teyit edin.</p></article></div></div></section>
    <section className="section faq-section"><div className="container-wide faq-layout"><div className="faq-intro"><SectionLabel>SIK SORULANLAR</SectionLabel><h2 className="display-font">Aklınızdaki<br /><em>sorular.</em></h2><p>Hizmet kapsamı koşullara göre değişebilir. Size özel bilgi için iletişim kurun.</p><Link href="/contact" className="text-link">Soru sorun <ArrowRight size={16} /></Link></div><FAQ /></div></section>
    <div className="container-wide"><CTA /></div>
  </main>;
}

function PageHero({ type, current }: { type: PageKey; current: string }) {
  const meta = pageMeta[type];
  return <><Breadcrumb current={current} /><section className="page-hero"><div className="container-wide page-hero-grid"><div><SectionLabel>{meta.eyebrow}</SectionLabel><h1 className="display-font">{meta.heading}</h1><p>{meta.description}</p></div><div className="page-hero-mark"><KeyRound size={38} /><span>Uygun hizmet<br />doğru bilgiyle.</span></div></div></section></>;
}

function ServicesPage() {
  return <main><PageHero type="services" current="Hizmetler" /><section className="section"><div className="container-wide"><div className="section-head"><div><SectionLabel>HİZMET BAŞLIKLARI</SectionLabel><h2 className="display-font">Evinizden aracınıza,<br /><em>kilit çözümleri.</em></h2></div><p>Her hizmetin kapsamı kilit ve anahtar sistemine göre değişebilir. Bir başlığa girerek ayrıntıları öğrenin.</p></div><ServiceCards /></div></section><div className="container-wide"><CTA title="Hangi hizmetin uygun olduğundan emin değil misiniz?" /></div><div className="spacer-bottom" /></main>;
}

function DetailPage({ type }: { type: 'automotive' | 'locksmith' | 'replacement' }) {
  const automotive = type === 'automotive';
  const replacement = type === 'replacement';
  const current = automotive ? 'Oto çilingir' : replacement ? 'Kilit değişimi' : 'Konut ve iş yeri çilingiri';
  const items = automotive ? [
    ['Araç anahtarı çoğaltma', 'Mevcut anahtarın türü ve aracın sistemine göre çoğaltma seçenekleri değerlendirilir.'],
    ['Kayıp araç anahtarı', 'Anahtarın tamamen kayıp olması durumunda araç marka, model ve yılına göre uygun işlem konuşulur.'],
    ['Kumanda ve akıllı anahtar', 'Kumanda ve akıllı anahtar sorunlarında pil, gövde ve araç uyumluluğu göz önünde bulundurulur.'],
    ['İmmobilizer hizmetleri', 'Anahtar tanıtma ve immobilizer sistemleri hakkında ön bilgi alınabilir.'],
  ] : replacement ? [
    ['Barel değişimi', 'Kapı barelinin durumu ve kapı tipi incelenerek uygun ölçü ve güvenlik seviyesi değerlendirilir.'],
    ['Kilit değişimi', 'Mevcut kilit arızası veya anahtar güvenliği ihtiyacına göre değişim seçenekleri sunulur.'],
    ['Kilit onarımı', 'Değişim gerekmeyebilecek durumlarda mekanizma kontrolü ve onarım ihtimali konuşulur.'],
    ['Yeni kilit montajı', 'Yeni kilit seçimi; kapı yapısı, kullanım ve güvenlik beklentilerine göre belirlenir.'],
  ] : [
    ['Konut ve apartman kapısı açma', 'Kapıda kalma durumlarında kapı ve kilit türü değerlendirilerek uygun yöntem belirlenir.'],
    ['İş yeri kapısı', 'İş yeri girişleri ve kilit sistemleri için hizmet kapsamı ve uygunluk teyit edilir.'],
    ['Çelik kapı kilitleri', 'Çelik kapı mekanizmasının yapısı değerlendirilerek açma, onarım veya değişim seçenekleri açıklanır.'],
    ['Kasa ve dolap kilitleri', 'Kilit türü ve erişim durumu hakkında bilgi alınarak uygun işlem konuşulur.'],
  ];
  const metaType = automotive ? 'automotive' : replacement ? 'replacement' : 'locksmith';
  return <main><PageHero type={metaType} current={current} /><section className="detail-intro"><div className="container-wide detail-intro-layout"><div><SectionLabel>{automotive ? 'ARAÇ ANAHTARI' : replacement ? 'KİLİT VE BAREL' : 'KAPI VE KİLİT'}</SectionLabel><h2 className="display-font">{automotive ? <>Her araç için<br /><em>ayrı bir anahtar sistemi.</em></> : replacement ? <>Önce arıza, sonra<br /><em>doğru değişim.</em></> : <>Güvenli erişim için<br /><em>doğru yaklaşım.</em></>}</h2></div><div className="detail-intro-text"><p>{automotive ? 'Araç anahtar sistemleri marka, model ve üretim yılına göre farklılık gösterir. Doğru yönlendirme için aracınız ve mevcut anahtar durumu hakkında bilgi paylaşın.' : replacement ? 'Kapı kilidi değişimi her zaman tek çözüm olmayabilir. Mekanizma, kapı yapısı ve güvenlik ihtiyacı birlikte değerlendirilerek uygun seçenek belirlenir.' : 'Kapının türü, kilit mekanizması ve sorunun niteliği uygulanabilecek yöntemi etkiler. Ön görüşmede doğru bilgileri paylaşmak çözüm seçeneklerini netleştirir.'}</p><Link href="/contact" className="text-link">İhtiyacınızı anlatın <ArrowRight size={16} /></Link></div></div></section><section className="detail-services"><div className="container-wide"><div className="detail-cards">{items.map(([title, text], i) => <article className="detail-card" key={title}><span className="detail-count">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section><section className="detail-image-section"><div className="container-wide detail-image-layout"><ImageWithFallback src={automotive ? '/car-keys.jpg' : '/lock-cylinder.jpg'} alt={automotive ? 'Modern araç anahtarları ve kumanda, araç iç konsolunda' : 'Kapı kilidi barelini dikkatle kontrol eden çilingir ustası'} className="detail-image" /><div><SectionLabel>ÖN DEĞERLENDİRME</SectionLabel><h2 className="display-font">Birkaç ayrıntı,<br /><em>daha doğru bilgi.</em></h2><p>{automotive ? 'Araç marka-model ve yılı, anahtarın kayıp olup olmadığı ve kumanda türü hakkında bilgi vermeniz yardımcı olur.' : 'Kapı tipi, kilit markası biliniyorsa adı ve sorunun nasıl ortaya çıktığı hakkında kısa bilgi paylaşın.'}</p><Link href="/contact" className="button-primary">İletişim seçenekleri <ArrowRight size={16} /></Link></div></div></section><section className="detail-note"><div className="container-wide note-layout"><CircleHelp /><p><strong>Ücret ve uygunluk:</strong> İşlem türü, kullanılan sistem ve koşullara göre değişebilir. Net ücret veya hizmet süresi, ayrıntılar doğrulandıktan sonra işletme tarafından paylaşılmalıdır.</p></div></section><div className="container-wide"><CTA /></div><div className="spacer-bottom" /></main>;
}

function ContactPage() {
  const phone = businessConfig.phone.trim();
  const wa = businessConfig.whatsapp.trim();
  return <main><PageHero type="contact" current="İletişim" /><section className="contact-page"><div className="container-wide contact-layout"><aside className="contact-aside"><SectionLabel>ULAŞMA SEÇENEKLERİ</SectionLabel><h2 className="display-font">Doğru kanalı<br /><em>seçin.</em></h2><p>Gerçek iletişim bilgileri eklendiğinde telefon ve WhatsApp bağlantıları burada etkinleşir.</p><div className="contact-info-list">
    <div className="contact-info-item"><span><Phone size={18} /></span><div><b>Telefon</b>{phone ? <a href={contactTarget(phone, 'phone')}>{phone}</a> : <small>İşletme telefonu henüz eklenmedi.</small>}</div></div>
    <div className="contact-info-item"><span><MessageCircle size={18} /></span><div><b>WhatsApp</b>{wa ? <a href={contactTarget(wa, 'whatsapp')} target="_blank" rel="noopener noreferrer">WhatsApp ile iletişim</a> : <small>WhatsApp bilgisi henüz eklenmedi.</small>}</div></div>
    <div className="contact-info-item"><span><MapPin size={18} /></span><div><b>Adres ve hizmet bölgesi</b><small>{businessConfig.address || (businessConfig.serviceAreas.length ? businessConfig.serviceAreas.join(', ') : 'İşletme konumu henüz eklenmedi.')}</small>{businessConfig.directionsUrl && <a href={businessConfig.directionsUrl} target="_blank" rel="noopener noreferrer">Yol tarifi al</a>}</div></div>
    <div className="contact-info-item"><span><Clock3 size={18} /></span><div><b>Çalışma saatleri</b><small>{businessConfig.openingHours || 'Çalışma saatleri henüz eklenmedi.'}</small></div></div>
  </div><div className="setup-callout"><BadgeInfo size={18} /><p>İletişim kanalları, işletme bilgileri doğrulanıp yapılandırıldıktan sonra kullanılabilir.</p></div></aside><ContactForm /></div></section></main>;
}

function PrivacyPage() {
  return <main><PageHero type="privacy" current="Gizlilik bildirimi" /><section className="privacy-content"><div className="container-wide privacy-wrap"><p className="privacy-lead">Bu metin, web sitesinin mevcut işleyişine ilişkin genel bilgilendirmedir. Yayına almadan önce veri sorumlusu bilgileri ve gerçek veri işleme süreçleri işletme tarafından gözden geçirilmelidir.</p><article><h2>1. Veri sorumlusu</h2><p>İşletme adı ve iletişim bilgileri henüz site yapılandırmasına eklenmedi. Gerçek işletme bilgileri sağlandığında bu bölüm güncellenmelidir.</p></article><article><h2>2. İletişim formu</h2><p>Bu sitedeki form yalnızca tarayıcıda çalışan örnek bir arayüzdür. Form gönderimi bir sunucuya, e-posta adresine veya işletmeye iletilmez; bu uygulama form verilerini kaydetmez.</p></article><article><h2>3. Telefon ve WhatsApp bağlantıları</h2><p>Bu bağlantılar, ancak işletme yapılandırmasına gerçek telefon ve WhatsApp bilgileri girildiğinde etkinleşir. Şu an yapılandırılmamış iletişim bilgileri için sahte bağlantı oluşturulmaz.</p></article><article><h2>4. Çerezler ve üçüncü taraf hizmetler</h2><p>Bu uygulama tarafından özel bir analiz veya reklam çerezi yapılandırılmamıştır. Kullanılan barındırma altyapısı veya tarayıcı hizmetlerinin kendi kayıt ve çerezleri olabilir; bunlar ilgili sağlayıcıların politikalarına tabidir.</p></article><article><h2>5. Güncelleme ve başvuru</h2><p>Gerçek kişisel veri işleme faaliyeti başladığında, amaç, hukuki sebep, saklama süresi, aktarım ve ilgili kişi başvuru kanalları somut işleyişe göre açıklanmalıdır. Bu sayfa hukuki danışmanlık yerine geçmez.</p></article><div className="privacy-contact"><ClipboardCheck /><div><strong>Bilgilendirme notu</strong><p>Bu metin genel bir web sitesi bilgilendirme taslağıdır; yürürlükteki mevzuat ve işletmenin fiili süreçleriyle uyumlu hâle getirilmelidir.</p></div></div><Link href="/contact" className="text-link">İletişim sayfasına dönün <ArrowRight size={16} /></Link></div></section></main>;
}

function SEO() {
  const [path] = useLocation();
  const routeKey: PageKey = path === '/services' ? 'services' : path === '/automotive-locksmith' ? 'automotive' : path === '/locksmith' ? 'locksmith' : path === '/lock-replacement' ? 'replacement' : path === '/contact' ? 'contact' : path === '/privacy-policy' ? 'privacy' : 'home';
  const meta = pageMeta[routeKey];
  useEffect(() => {
    document.title = meta.title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); document.head.appendChild(element); }
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:locale"]', 'content', 'tr_TR');
    setMeta('meta[name="twitter:card"]', 'content', 'summary');
    const configuredBase = businessConfig.canonicalBaseUrl.trim().replace(/\/$/, '');
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (configuredBase) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = `${configuredBase}${path}`;
      setMeta('meta[property="og:url"]', 'content', `${configuredBase}${path}`);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
    const oldSchema = document.getElementById('local-business-schema');
    oldSchema?.remove();
    if (businessConfig.verifiedBusinessDetails && businessConfig.name.trim() && businessConfig.phone.trim() && businessConfig.address.trim()) {
      const schema = document.createElement('script');
      schema.id = 'local-business-schema';
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Locksmith', name: businessConfig.name, telephone: businessConfig.phone, address: { '@type': 'PostalAddress', streetAddress: businessConfig.address, ...(businessConfig.city ? { addressLocality: businessConfig.city } : {}), ...(businessConfig.district ? { addressRegion: businessConfig.district } : {}), addressCountry: 'TR' }, ...(configuredBase ? { url: configuredBase } : {}), ...(businessConfig.openingHours ? { openingHours: businessConfig.openingHours } : {}) });
      document.head.appendChild(schema);
    }
  }, [path, meta]);
  return null;
}

function RouteContent() {
  return <><SEO /><div className="site-shell grain"><Header /><Switch>
    <Route path="/" component={HomePage} /><Route path="/services" component={ServicesPage} />
    <Route path="/automotive-locksmith"><DetailPage type="automotive" /></Route>
    <Route path="/locksmith"><DetailPage type="locksmith" /></Route>
    <Route path="/lock-replacement"><DetailPage type="replacement" /></Route>
    <Route path="/contact" component={ContactPage} /><Route path="/privacy-policy" component={PrivacyPage} />
    <Route component={NotFound} />
  </Switch><Footer /><MobileContact /></div></>;
}

function Router() {
  return <ErrorBoundary><RouteContent /></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
