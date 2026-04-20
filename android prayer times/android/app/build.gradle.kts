import org.gradle.api.tasks.Sync

plugins {
    id("com.android.application")
    kotlin("android")
}

val webRoot = file("../..")
val generatedWebAssets = layout.buildDirectory.dir("generated/assets/site")

val syncWebAssets by tasks.registering(Sync::class) {
    from(webRoot) {
        include("index.html")
        include("script.js")
        include("style.css")
        include("manifest.json")
        include("sw.js")
        include("icons/**")
    }
    into(generatedWebAssets)
}

android {
    namespace = "com.motxzl.prayertimes"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.motxzl.prayertimes"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets.getByName("main").assets.srcDir(generatedWebAssets)
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.10.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
}
