package com.motxzl.prayertimes

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.text.format.DateFormat
import android.widget.RemoteViews
import java.util.Calendar

class PrayerWidget : AppWidgetProvider() {

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == ACTION_REFRESH_WIDGET) {
            updateWidgets(context)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        // Schedule periodic updates if needed
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_prayer)
        val snapshot = PrayerSchedule.default().snapshot(context)

        views.setTextViewText(R.id.current_prayer, snapshot.currentPrayerName)
        views.setTextViewText(
            R.id.current_prayer_time,
            context.getString(R.string.widget_current_time, snapshot.currentPrayerTime)
        )
        views.setTextViewText(
            R.id.next_prayer_time,
            context.getString(R.string.next_prayer, "${snapshot.nextPrayerName} at ${snapshot.nextPrayerTime}")
        )
        views.setTextViewText(
            R.id.last_update,
            context.getString(R.string.last_update, snapshot.updatedAt)
        )

        val openAppIntent = Intent(context, MainActivity::class.java)
        val openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val refreshIntent = Intent(context, PrayerWidget::class.java).apply {
            action = ACTION_REFRESH_WIDGET
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            refreshIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        views.setOnClickPendingIntent(R.id.widget_layout, openAppPendingIntent)
        views.setOnClickPendingIntent(R.id.open_app_action, openAppPendingIntent)
        views.setOnClickPendingIntent(R.id.refresh_action, refreshPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    companion object {
        fun updateWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, PrayerWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            if (appWidgetIds.isNotEmpty()) {
                PrayerWidget().onUpdate(context, appWidgetManager, appWidgetIds)
            }
        }

        private const val ACTION_REFRESH_WIDGET = "com.motxzl.prayertimes.action.REFRESH_WIDGET"
    }
}

private data class PrayerEntry(
    val nameRes: Int,
    val hourOfDay: Int,
    val minute: Int
)

private data class PrayerSnapshot(
    val currentPrayerName: String,
    val currentPrayerTime: String,
    val nextPrayerName: String,
    val nextPrayerTime: String,
    val updatedAt: String
)

private class PrayerSchedule(
    private val prayers: List<PrayerEntry>
) {
    fun snapshot(context: Context): PrayerSnapshot {
        val now = Calendar.getInstance()
        val formatter = DateFormat.getTimeFormat(context)
        val entriesForToday = prayers.map { prayer ->
            prayer to Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, prayer.hourOfDay)
                set(Calendar.MINUTE, prayer.minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
        }

        val nextPrayer =
            entriesForToday.firstOrNull { (_, time) -> now.before(time) } ?: entriesForToday.first()
        val currentPrayer =
            entriesForToday.lastOrNull { (_, time) -> !now.before(time) } ?: entriesForToday.last()

        return PrayerSnapshot(
            currentPrayerName = context.getString(currentPrayer.first.nameRes),
            currentPrayerTime = formatter.format(currentPrayer.second.time),
            nextPrayerName = context.getString(nextPrayer.first.nameRes),
            nextPrayerTime = formatter.format(nextPrayer.second.time),
            updatedAt = formatter.format(now.time)
        )
    }

    companion object {
        fun default(): PrayerSchedule {
            return PrayerSchedule(
                listOf(
                    PrayerEntry(R.string.prayer_fajr, 4, 35),
                    PrayerEntry(R.string.prayer_sunrise, 6, 5),
                    PrayerEntry(R.string.prayer_dhuhr, 11, 56),
                    PrayerEntry(R.string.prayer_asr, 15, 29),
                    PrayerEntry(R.string.prayer_maghrib, 18, 18),
                    PrayerEntry(R.string.prayer_isha, 19, 38)
                )
            )
        }
    }
}
