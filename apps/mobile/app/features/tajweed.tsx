import { Page, SectionHeader } from '../../src/components/ui';
import { TajweedCoach } from '../../src/features/quran/components/TajweedCoach';

export default function TajweedFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="مدرب التجويد" subtitle="حلّل تلاوتك واحصل على تغذية راجعة فورية" />
      <TajweedCoach surah={1} ayah={1} />
    </Page>
  );
}
