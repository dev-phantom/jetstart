plugins {
    kotlin("jvm") version "1.9.22"
    `java-gradle-plugin`
    `maven-publish`
}

group = "com.jetstart"
version = "1.0.0"

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation(gradleApi())
    implementation("org.ow2.asm:asm:9.6")
    implementation("org.ow2.asm:asm-commons:9.6")
    implementation("org.ow2.asm:asm-util:9.6")

    // Android Gradle Plugin for Transform API
    compileOnly("com.android.tools.build:gradle:8.2.0")

    testImplementation(kotlin("test"))
}

gradlePlugin {
    plugins {
        create("hotReload") {
            id = "com.jetstart.hot-reload"
            implementationClass = "com.jetstart.gradle.JetStartPlugin"
        }
    }
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}
