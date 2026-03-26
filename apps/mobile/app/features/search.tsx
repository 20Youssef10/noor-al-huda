import { Page, SectionHeader } from '../../src/components/ui';
import { SemanticSearch } from '../../src/features/quran/components/SemanticSearch';

export default function SemanticSearchFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="البحث الدلالي" subtitle="ابحث في القرآن بالمعنى والمقاصد" />
      <SemanticSearch />
    </Page>
  );
}
