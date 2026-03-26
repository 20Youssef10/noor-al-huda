import WidgetKit
import SwiftUI

@main
struct NoorAlHudaWidgetsBundle: WidgetBundle {
  var body: some Widget {
    NoorAlHudaWidgets()
    if #available(iOS 16.1, *) {
      NoorAlHudaLiveActivity()
    }
  }
}
