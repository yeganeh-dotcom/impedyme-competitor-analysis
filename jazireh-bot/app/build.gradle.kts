import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.impedyme.jazirehbot"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.impedyme.jazirehbot"
        minSdk = 30          // AccessibilityService.takeScreenshot() needs Android 11+
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
    }

    // Local-only signing key so every CI build has the same signature and
    // installs over the previous one. It has no value outside this project.
    signingConfigs {
        create("sideload") {
            storeFile = rootProject.file("keystore/jazireh-bot.jks")
            storePassword = "jazirehbot"
            keyAlias = "jazirehbot"
            keyPassword = "jazirehbot"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            isShrinkResources = false
            signingConfig = signingConfigs.getByName("sideload")
        }
        debug {
            signingConfig = signingConfigs.getByName("sideload")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }

    packaging {
        resources.excludes += setOf("META-INF/*.kotlin_module", "META-INF/versions/9/previous-compilation-data.bin")
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    // Deliberately no AndroidX: only the framework + coroutines, to keep the build small and predictable.
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
