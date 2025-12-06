/**
 * Template Generator
 * Creates project structure from templates
 */

import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import { TemplateOptions } from '../types';
import { MIN_ANDROID_API_LEVEL, TARGET_ANDROID_API_LEVEL } from '@jetstart/shared';

export async function generateProjectTemplate(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const { projectName, packageName } = options;

  // Create directory structure
  await createDirectoryStructure(projectPath);

  // Generate files
  await generateRootBuildGradle(projectPath);
  await generateBuildGradle(projectPath, options);
  await generateSettingsGradle(projectPath, projectName);
  await generateGradleProperties(projectPath);
  await generateGradleWrapper(projectPath);
  await generateMainActivity(projectPath, packageName);
  await generateHotReload(projectPath, packageName);
  await generateDSLInterpreter(projectPath, packageName);
  await generateDSLTypes(projectPath, packageName);
  await generateAndroidManifest(projectPath, options);
  await generateResourceFiles(projectPath, projectName);
  await generateLocalProperties(projectPath);
  await generateJetStartConfig(projectPath, options);
  await generateGitignore(projectPath);
  await generateReadme(projectPath, projectName);
}

async function createDirectoryStructure(projectPath: string): Promise<void> {
  const dirs = [
    'app/src/main/java',
    'app/src/main/res/layout',
    'app/src/main/res/values',
    'app/src/main/res/drawable',
    'gradle/wrapper',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }
}

async function generateBuildGradle(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const content = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${options.packageName}'
    compileSdk ${TARGET_ANDROID_API_LEVEL}

    defaultConfig {
        applicationId "${options.packageName}"
        minSdk ${MIN_ANDROID_API_LEVEL}
        targetSdk ${TARGET_ANDROID_API_LEVEL}
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    buildFeatures {
        compose true
        buildConfig true  // Required for JetStart hot reload
    }

    composeOptions {
        kotlinCompilerExtensionVersion = '1.5.6'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
    implementation 'androidx.activity:activity-compose:1.8.1'
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'

    // JetStart Hot Reload dependencies
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}`;

  await fs.writeFile(path.join(projectPath, 'app/build.gradle'), content);
}

async function generateSettingsGradle(
  projectPath: string,
  projectName: string
): Promise<void> {
  const content = `rootProject.name = "${projectName}"
include ':app'`;

  await fs.writeFile(path.join(projectPath, 'settings.gradle'), content);
}

async function generateGradleProperties(projectPath: string): Promise<void> {
  const content = `org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
kotlin.code.style=official`;

  await fs.writeFile(path.join(projectPath, 'gradle.properties'), content);
}

async function generateMainActivity(
  projectPath: string,
  packageName: string
): Promise<void> {
  const packagePath = packageName.replace(/\./g, '/');
  const activityPath = path.join(
    projectPath,
    'app/src/main/java',
    packagePath,
    'MainActivity.kt'
  );

  const content = `package ${packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize hot reload - reads from BuildConfig injected by jetstart dev
        try {
            val serverUrl = BuildConfig.JETSTART_SERVER_URL
            val sessionId = BuildConfig.JETSTART_SESSION_ID
            HotReload.connect(this, serverUrl, sessionId)
        } catch (e: Exception) {
            // BuildConfig not available yet, hot reload will be disabled
            android.util.Log.w("MainActivity", "Hot reload not configured: \${e.message}")
        }

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Check if we should render from DSL (hot reload mode)
                    val dsl by DSLInterpreter.currentDSL.collectAsState()

                    if (dsl != null) {
                        // Hot reload mode: render from DSL sent by server
                        DSLInterpreter.RenderDSL(dsl!!)
                    } else {
                        // Normal mode: render actual Compose code
                        AppContent()
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        HotReload.disconnect()
    }
}

/**
 * Main App Content - REAL Kotlin Compose Code!
 * This gets parsed to DSL and sent via hot reload
 */
@Composable
fun AppContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to JetStart! 🚀",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Edit this code and save to see hot reload!",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { /* Handle click */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Click Me!")
        }
    }
}`;

  await fs.ensureDir(path.dirname(activityPath));
  await fs.writeFile(activityPath, content);
}

async function generateAndroidManifest(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const themeName = options.projectName.replace(/[^a-zA-Z0-9]/g, '');
  const content = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/Theme.${themeName}"
        android:networkSecurityConfig="@xml/network_security_config">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;

  await fs.writeFile(
    path.join(projectPath, 'app/src/main/AndroidManifest.xml'),
    content
  );
}

async function generateJetStartConfig(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const config = {
    projectName: options.projectName,
    packageName: options.packageName,
    version: '1.0.0',
    jetstart: {
      version: '0.1.0',
      enableHotReload: true,
      enableLogs: true,
      port: 8765,
    },
  };

  await fs.writeJSON(
    path.join(projectPath, 'jetstart.config.json'),
    config,
    { spaces: 2 }
  );
}

async function generateGitignore(projectPath: string): Promise<void> {
  const content = `# Build
/build
/app/build
.gradle
*.hprof

# IDE
.idea
*.iml
.vscode
.DS_Store

# Claude Code
.claude
.claude-worktrees

# JetStart
.jetstart

# Android
local.properties
*.apk
*.aab
*.ap_
*.dex
*.class
bin/
gen/
out/
captures/
.externalNativeBuild
.cxx

# Log files
*.log

# Keystore files
*.jks
*.keystore`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), content);
}

async function generateReadme(projectPath: string, projectName: string): Promise<void> {
  const content = `# ${projectName}

A JetStart project with Kotlin and Jetpack Compose.

## Getting Started

\`\`\`bash
# Start development server
jetstart dev

# Build production APK
jetstart build

# View logs
jetstart logs
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── app/
│   └── src/
│       └── main/
│           ├── java/          # Kotlin source files
│           └── res/           # Resources
├── jetstart.config.json       # JetStart configuration
└── build.gradle               # Gradle build file
\`\`\`

## Learn More

- [JetStart Documentation](https://github.com/phantom/jetstart)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), content);
}

async function generateRootBuildGradle(projectPath: string): Promise<void> {
  const content = `// Top-level build file
buildscript {
    ext {
        kotlin_version = '1.9.21'
        compose_version = '1.5.4'
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;

  await fs.writeFile(path.join(projectPath, 'build.gradle'), content);
}

async function generateGradleWrapper(projectPath: string): Promise<void> {
  // Use system Gradle to initialize proper wrapper
  // This generates:
  // - gradle/wrapper/gradle-wrapper.jar
  // - gradle/wrapper/gradle-wrapper.properties
  // - gradlew (Unix shell script)
  // - gradlew.bat (Windows batch script)

  return new Promise<void>((resolve) => {
    // Try to use system gradle to generate wrapper
    const gradleCmd = process.platform === 'win32' ? 'gradle.bat' : 'gradle';

    const gradleProcess = spawn(gradleCmd, ['wrapper', '--gradle-version', '8.2'], {
      cwd: projectPath,
      shell: true,
    });

    gradleProcess.on('close', (code) => {
      // Continue regardless of success/failure
      // If gradle wrapper command fails, the build will fall back to system gradle
      resolve();
    });

    gradleProcess.on('error', () => {
      // Continue even if gradle command not found
      resolve();
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      gradleProcess.kill();
      resolve();
    }, 30000);
  });
}

async function generateResourceFiles(
  projectPath: string,
  projectName: string
): Promise<void> {
  // Generate strings.xml
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${projectName}</string>
</resources>`;

  await fs.writeFile(
    path.join(projectPath, 'app/src/main/res/values/strings.xml'),
    stringsXml
  );

  // Generate colors.xml
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>`;

  await fs.writeFile(
    path.join(projectPath, 'app/src/main/res/values/colors.xml'),
    colorsXml
  );

  // Generate themes.xml
  const themesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.${projectName.replace(/[^a-zA-Z0-9]/g, '')}" parent="android:Theme.Material.Light.NoActionBar" />
</resources>`;

  await fs.writeFile(
    path.join(projectPath, 'app/src/main/res/values/themes.xml'),
    themesXml
  );

  // Generate network_security_config.xml for development (allows cleartext traffic)
  const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

  await fs.ensureDir(path.join(projectPath, 'app/src/main/res/xml'));
  await fs.writeFile(
    path.join(projectPath, 'app/src/main/res/xml/network_security_config.xml'),
    networkSecurityConfig
  );
}

async function generateLocalProperties(projectPath: string): Promise<void> {
  // Auto-detect Android SDK location
  let androidSdkPath: string | undefined;

  // Check environment variables first
  androidSdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  // If not found, check common Windows locations
  if (!androidSdkPath && process.platform === 'win32') {
    const commonPaths = [
      'C:\\Android',
      path.join(require('os').homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
      'C:\\Android\\Sdk',
      'C:\\Program Files (x86)\\Android\\android-sdk',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        androidSdkPath = p;
        break;
      }
    }
  }

  // If not found on macOS/Linux, check common paths
  if (!androidSdkPath && process.platform !== 'win32') {
    const commonPaths = [
      path.join(require('os').homedir(), 'Android', 'Sdk'),
      path.join(require('os').homedir(), 'Library', 'Android', 'sdk'),
      '/opt/android-sdk',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        androidSdkPath = p;
        break;
      }
    }
  }

  if (!androidSdkPath) {
    console.warn('[Warning] Android SDK not found. You may need to set ANDROID_HOME or create local.properties manually.');
    return;
  }

  // Create local.properties with SDK path
  const content = `# Auto-generated by JetStart
sdk.dir=${androidSdkPath.replace(/\\/g, '\\\\')}
`;

  await fs.writeFile(path.join(projectPath, 'local.properties'), content);
  console.log(`[JetStart] Created local.properties with SDK: ${androidSdkPath}`);
}
async function generateHotReload(
  projectPath: string,
  packageName: string
): Promise<void> {
  const packagePath = packageName.replace(/\./g, '/');
  const hotReloadPath = path.join(
    projectPath,
    'app/src/main/java',
    packagePath,
    'HotReload.kt'
  );

  // Copy from my-app template
  const sourceFile = path.join(__dirname, '../../../../my-app/app/src/main/java/com/jetstart/myapp/HotReload.kt');
  
  try {
    let content = await fs.readFile(sourceFile, 'utf-8');
    // Replace package name
    content = content.replace(/package com\.jetstart\.myapp/g, `package ${packageName}`);
    
    await fs.ensureDir(path.dirname(hotReloadPath));
    await fs.writeFile(hotReloadPath, content);
  } catch (error) {
    console.warn('[Warning] Could not copy HotReload.kt from my-app. You may need to add it manually.');
  }
}

async function generateDSLInterpreter(
  projectPath: string,
  packageName: string
): Promise<void> {
  const packagePath = packageName.replace(/\./g, '/');
  const interpreterPath = path.join(
    projectPath,
    'app/src/main/java',
    packagePath,
    'DSLInterpreter.kt'
  );

  const sourceFile = path.join(__dirname, '../../../../my-app/app/src/main/java/com/jetstart/myapp/DSLInterpreter.kt');
  
  try {
    let content = await fs.readFile(sourceFile, 'utf-8');
    content = content.replace(/package com\.jetstart\.myapp/g, `package ${packageName}`);
    
    await fs.ensureDir(path.dirname(interpreterPath));
    await fs.writeFile(interpreterPath, content);
  } catch (error) {
    console.warn('[Warning] Could not copy DSLInterpreter.kt from my-app. You may need to add it manually.');
  }
}

async function generateDSLTypes(
  projectPath: string,
  packageName: string
): Promise<void> {
  const packagePath = packageName.replace(/\./g, '/');
  const typesPath = path.join(
    projectPath,
    'app/src/main/java',
    packagePath,
    'DSLTypes.kt'
  );

  const sourceFile = path.join(__dirname, '../../../../my-app/app/src/main/java/com/jetstart/myapp/DSLTypes.kt');
  
  try {
    let content = await fs.readFile(sourceFile, 'utf-8');
    content = content.replace(/package com\.jetstart\.myapp/g, `package ${packageName}`);
    
    await fs.ensureDir(path.dirname(typesPath));
    await fs.writeFile(typesPath, content);
  } catch (error) {
    console.warn('[Warning] Could not copy DSLTypes.kt from my-app. You may need to add it manually.');
  }
}
