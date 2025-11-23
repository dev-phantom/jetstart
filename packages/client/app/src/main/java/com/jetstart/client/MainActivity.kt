package com.jetstart.client

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.jetstart.client.ui.screens.*
import com.jetstart.client.ui.theme.JetStartTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JetStartTheme {
                JetStartApp()
            }
        }
    }
}

@Composable
fun JetStartApp() {
    val navController = rememberNavController()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        NavHost(
            navController = navController,
            startDestination = "home"
        ) {
            composable("home") {
                HomeScreen(
                    onScanQR = { navController.navigate("scanner") },
                    onViewLogs = { navController.navigate("logs") }
                )
            }
            
            composable("scanner") {
                ScannerScreen(
                    onQRScanned = { qrData ->
                        navController.navigate("connection/$qrData")
                    },
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable("connection/{qrData}") { backStackEntry ->
                val qrData = backStackEntry.arguments?.getString("qrData") ?: ""
                ConnectionScreen(
                    qrData = qrData,
                    onBack = { navController.popBackStack() }
                )
            }
            
            composable("logs") {
                LogsScreen(
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}