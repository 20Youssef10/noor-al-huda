import { Page, SectionHeader } from '../../src/components/ui';
import { DuaGenerator } from '../../src/features/azkar/components/DuaGenerator';

export default function DuaFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="مولد الدعاء" subtitle="دعاء مخصص بلغة عربية فصيحة ومصادر موثوقة" />
      <DuaGenerator />
    </Page>
  );
}
