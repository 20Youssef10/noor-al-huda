import { SiteShell } from '@/components/site-shell';

const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س'];

export default function KidsPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Kids</p>
          <h2>وضع الأطفال</h2>
        </div>
        <div className="kids-grid">
          {letters.map((letter) => (
            <div key={letter} className="kid-letter-card">{letter}</div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
