import Foundation
import React

@objc(WidgetBridge)
class WidgetBridge: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(updateWidget:resolver:rejecter:)
  func updateWidget(_ payload: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: "group.com.nooralhuda.app")
    defaults?.set(payload, forKey: "prayer_data")
    defaults?.synchronize()
    resolve(true)
  }
}
