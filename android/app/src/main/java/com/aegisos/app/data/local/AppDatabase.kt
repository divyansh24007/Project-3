package com.aegisos.app.data.local

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

/**
 * CachedInvestigation:
 * Room entity representing an offline-cached security investigation record.
 */
@Entity(tableName = "cached_investigations")
data class CachedInvestigation(
    @PrimaryKey
    val id: String,
    val inputType: String,
    val riskLevel: String,
    val summary: String,
    val createdAt: String
)

/**
 * CachedEvent:
 * Room entity representing an offline-cached security telemetry or alert event.
 */
@Entity(tableName = "cached_events")
data class CachedEvent(
    @PrimaryKey
    val id: String,
    val type: String,
    val severity: String,
    val description: String,
    val createdAt: String
)

/**
 * InvestigationDao:
 * Data access object for querying and persisting cached investigations.
 */
@Dao
interface InvestigationDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(investigation: CachedInvestigation)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(investigations: List<CachedInvestigation>)

    @Query("SELECT * FROM cached_investigations ORDER BY createdAt DESC")
    fun getAll(): Flow<List<CachedInvestigation>>

    @Query("SELECT * FROM cached_investigations ORDER BY createdAt DESC")
    suspend fun getAllList(): List<CachedInvestigation>

    @Query("SELECT * FROM cached_investigations WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): CachedInvestigation?

    @Query("DELETE FROM cached_investigations")
    suspend fun deleteAll()
}

/**
 * EventDao:
 * Data access object for querying recent security events and telemetry.
 */
@Dao
interface EventDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(event: CachedEvent)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(events: List<CachedEvent>)

    @Query("SELECT * FROM cached_events ORDER BY createdAt DESC LIMIT :limit")
    fun getRecent(limit: Int): Flow<List<CachedEvent>>

    @Query("SELECT * FROM cached_events ORDER BY createdAt DESC LIMIT :limit")
    suspend fun getRecentList(limit: Int): List<CachedEvent>

    @Query("DELETE FROM cached_events")
    suspend fun deleteAll()
}

/**
 * AppDatabase:
 * Primary Room database for AEGISOS on-device storage.
 *
 * Requirements:
 * - Room database with entities: CachedInvestigation, CachedEvent
 * - InvestigationDao with insert, getAll, deleteAll
 * - EventDao with insert, getRecent(limit), deleteAll
 */
@Database(
    entities = [CachedInvestigation::class, CachedEvent::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun investigationDao(): InvestigationDao
    abstract fun eventDao(): EventDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "aegisos_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
