import { Page, SectionHeader } from '../../src/components/ui';
import { ShareCardGenerator } from '../../src/features/sharing/ShareCardGenerator';

export default function ShareFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="بطاقات المشاركة" subtitle="عدّل النص والخلفية والقالب قبل المشاركة" />
      <ShareCardGenerator
        type="ayah"
        content_ar="رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا"
        source="سورة آل عمران: 8"
        template_id={1}
        format="story"
      />
    </Page>
  );
}
