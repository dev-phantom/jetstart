/**
 * Template Generator
 * Creates project structure from templates
 */

import path from 'path';
import fs from 'fs-extra';
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
  await generateBuildGradle(projectPath, options);
  await generateSettingsGradle(projectPath, projectName);
  await generateGradleProperties(projectPath);
  await generateMainActivity(projectPath, packageName);
  await generateAndroidManifest(projectPath, packageName);
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
    }

    composeOptions {
        kotlinCompilerExtensionVersion = '1.5.3'
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
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppContent()
                }
            }
        }
    }
}

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
            text = "Edit this file and save to see hot reload in action",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}`;

  await fs.ensureDir(path.dirname(activityPath));
  await fs.writeFile(activityPath, content);
}

async function generateAndroidManifest(
  projectPath: string,
  _packageName: string
): Promise<void> {
  const content = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AppCompat.Light">
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

# IDE
.idea
*.iml
.vscode

# JetStart
.jetstart

# Android
local.properties
*.apk
*.aab`;

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