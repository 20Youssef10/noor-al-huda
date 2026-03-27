package com.nooralhuda.app.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "WidgetBridge"

  @ReactMethod
  fun updateWidget(payload: String, promise: Promise) {
    try {
      val sharedPreferences = reactContext.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
      sharedPreferences.edit().putString(KEY_PRAYER_DATA, payload).apply()

      val manager = AppWidgetManager.getInstance(reactContext)
      val componentName = ComponentName(reactContext, PrayerWidgetProvider::class.java)
      val ids = manager.getAppWidgetIds(componentName)
      PrayerWidgetProvider.render(reactContext, manager, ids)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("WIDGET_UPDATE_FAILED", error)
    }
  }

  companion object {
    const val SHARED_PREFS_NAME = "noor_al_huda_widget"
    const val KEY_PRAYER_DATA = "prayer_data"
  }
}
