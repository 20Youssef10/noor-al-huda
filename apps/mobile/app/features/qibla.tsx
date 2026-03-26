import { Page, SectionHeader } from '../../src/components/ui';
import { ARQibla } from '../../src/features/prayer/components/ARQibla';
import { useAppStore } from '../../src/store/app-store';

export default function QiblaFeatureScreen() {
  const location = useAppStore((state) => state.settings.location);

  return (
    <Page>
      <SectionHeader title="القبلة المعززة" subtitle={`موقعك الحالي: ${location.label}`} />
      <ARQibla latitude={location.latitude} longitude={location.longitude} />
    </Page>
  );
}
