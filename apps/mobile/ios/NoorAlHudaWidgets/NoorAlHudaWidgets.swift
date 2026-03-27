import WidgetKit
import SwiftUI
import ActivityKit

struct NoorWidgetEntry: TimelineEntry {
  let date: Date
  let prayerName: String
  let prayerTime: String
  let countdown: String
}

struct NoorWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> NoorWidgetEntry {
    NoorWidgetEntry(date: Date(), prayerName: "العصر", prayerTime: "٣:٤٥ م", countdown: "٤٧ دقيقة")
  }

  func getSnapshot(in context: Context, completion: @escaping (NoorWidgetEntry) -> Void) {
    completion(placeholder(in: context))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<NoorWidgetEntry>) -> Void) {
    let defaults = UserDefaults(suiteName: "group.com.nooralhuda.app")
    let raw = defaults?.string(forKey: "prayer_data")
    let entry = NoorWidgetEntry(date: Date(), prayerName: raw == nil ? "الصلاة القادمة" : "مزامنة نور الهدى", prayerTime: raw == nil ? "--:--" : "جاهز", countdown: raw == nil ? "—" : "تحديث مستمر")
    completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(60))))
  }
}

struct NoorWidgetView: View {
  let entry: NoorWidgetEntry

  var body: some View {
    VStack(alignment: .trailing, spacing: 8) {
      Text(entry.prayerName).font(.headline).foregroundStyle(.yellow)
      Text(entry.prayerTime).font(.system(size: 30, weight: .bold)).foregroundStyle(.white)
      Text(entry.countdown).font(.subheadline).foregroundStyle(.white.opacity(0.72))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
    .padding()
    .containerBackground(Color(red: 0.07, green: 0.06, blue: 0.04), for: .widget)
  }
}

struct NoorAlHudaWidgets: Widget {
  let kind: String = "NoorAlHudaPrayerWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: NoorWidgetProvider()) { entry in
      NoorWidgetView(entry: entry)
    }
    .configurationDisplayName("مواقيت نور الهدى")
    .description("يعرض الصلاة القادمة مع العد التنازلي.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@available(iOS 16.1, *)
struct NoorAlHudaLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: NoorAlHudaPlaybackAttributes.self) { context in
      VStack(alignment: .trailing, spacing: 10) {
        Text(context.state.surahName)
          .font(.headline)
          .foregroundStyle(.yellow)
        Text("الآية \(context.state.ayahNumber)")
          .font(.subheadline)
          .foregroundStyle(.white)
        Text(context.state.reciterName)
          .font(.caption)
          .foregroundStyle(.white.opacity(0.72))
        ProgressView(value: context.state.progressPercent)
          .tint(.yellow)
      }
      .frame(maxWidth: .infinity, alignment: .trailing)
      .padding()
      .activityBackgroundTint(Color(red: 0.07, green: 0.06, blue: 0.04))
      .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Text(context.state.surahName)
            .foregroundStyle(.yellow)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Image(systemName: context.state.isPlaying ? "pause.fill" : "play.fill")
            .foregroundStyle(.white)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .trailing, spacing: 6) {
            Text(context.state.reciterName)
              .foregroundStyle(.white)
            ProgressView(value: context.state.progressPercent)
              .tint(.yellow)
          }
        }
      } compactLeading: {
        Text(String(context.state.surahName.prefix(4)))
          .foregroundStyle(.yellow)
      } compactTrailing: {
        Image(systemName: context.state.isPlaying ? "pause.fill" : "play.fill")
          .foregroundStyle(.white)
      } minimal: {
        Image(systemName: "waveform")
          .foregroundStyle(.yellow)
      }
    }
  }
}
