import ActivityKit

@available(iOS 16.1, *)
struct NoorAlHudaPlaybackAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var surahName: String
    var ayahNumber: Int
    var reciterName: String
    var isPlaying: Bool
    var progressPercent: Double
  }

  var title: String
}
