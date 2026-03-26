package com.nooralhuda.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.nooralhuda.app.R
import org.json.JSONObject

class PrayerWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    render(context, appWidgetManager, appWidgetIds)
  }

  companion object {
    fun render(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
      val sharedPreferences = context.getSharedPreferences(WidgetBridgeModule.SHARED_PREFS_NAME, Context.MODE_PRIVATE)
      val payload = sharedPreferences.getString(WidgetBridgeModule.KEY_PRAYER_DATA, null)
      val json = if (payload.isNullOrBlank()) null else JSONObject(payload)
      val nextPrayer = json?.optJSONObject("nextPrayer")
      val prayerName = when (nextPrayer?.optString("name")) {
        "fajr" -> "الفجر"
        "dhuhr" -> "الظهر"
        "asr" -> "العصر"
        "maghrib" -> "المغرب"
        "isha" -> "العشاء"
        "sunrise" -> "الشروق"
        else -> "الصلاة القادمة"
      }
      val prayerTime = nextPrayer?.optString("at") ?: "--:--"
      val countdown = nextPrayer?.optInt("minutesUntil")?.let { "$it دقيقة" } ?: "—"

      appWidgetIds.forEach { widgetId ->
        val views = RemoteViews(context.packageName, R.layout.prayer_widget).apply {
          setTextViewText(R.id.widget_title, prayerName)
          setTextViewText(R.id.widget_time, prayerTime)
          setTextViewText(R.id.widget_countdown, countdown)
        }
        appWidgetManager.updateAppWidget(widgetId, views)
      }
    }
  }
}
