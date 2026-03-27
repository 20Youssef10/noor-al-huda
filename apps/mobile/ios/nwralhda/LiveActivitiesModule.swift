import Foundation
import React
import ActivityKit

@objc(LiveActivities)
class LiveActivities: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(startActivity:payload:resolver:rejecter:)
  func startActivity(_ name: String, payload: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(false)
      return
    }

    do {
      let decoded = try JSONDecoder().decode(NoorAlHudaPlaybackAttributes.ContentState.self, from: Data(payload.utf8))
      let attributes = NoorAlHudaPlaybackAttributes(title: name)
      _ = try Activity.request(attributes: attributes, contentState: decoded)
      resolve(true)
    } catch {
      reject("LIVE_ACTIVITY_START_FAILED", error.localizedDescription, error)
    }
  }

  @objc(updateActivity:payload:resolver:rejecter:)
  func updateActivity(_ name: String, payload: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(false)
      return
    }

    Task {
      do {
        let decoded = try JSONDecoder().decode(NoorAlHudaPlaybackAttributes.ContentState.self, from: Data(payload.utf8))
        for activity in Activity<NoorAlHudaPlaybackAttributes>.activities where activity.attributes.title == name {
          await activity.update(using: decoded)
        }
        resolve(true)
      } catch {
        reject("LIVE_ACTIVITY_UPDATE_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(endActivity:resolver:rejecter:)
  func endActivity(_ name: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard #available(iOS 16.1, *) else {
      resolve(false)
      return
    }

    Task {
      for activity in Activity<NoorAlHudaPlaybackAttributes>.activities where activity.attributes.title == name {
        await activity.end(dismissalPolicy: .immediate)
      }
      resolve(true)
    }
  }
}
