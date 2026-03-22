package com.jetstart.hotreload;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/**
 * WebSocket client for receiving hot reload updates from the JetStart core server.
 *
 * Handles the following message types from the server:
 * - core:dex-reload   — True hot reload (DEX-based class swapping)
 * - core:build-complete — Full APK rebuild fallback
 * - core:reload        — Full activity restart
 */
public class HotReloadClient {
    private static final String TAG = "HotReloadClient";

    private final Activity activity;
    private final String serverUrl;
    private final String sessionId;
    private final HotReloadRuntime runtime;

    private OkHttpClient client;
    private WebSocket webSocket;
    private Handler mainHandler;
    private boolean isConnected = false;
    private int reconnectAttempts = 0;
    private static final int MAX_RECONNECT_ATTEMPTS = 10;

    // Ignore the first build-complete after connecting (it's the old build)
    private boolean ignoreFirstBuild = true;
    private long connectionTime = 0;

    public interface ReloadListener {
        void onReloadStarted();
        void onReloadComplete(boolean success);
        void onConnectionStateChanged(boolean connected);
    }

    private ReloadListener reloadListener;

    public HotReloadClient(Activity activity, String serverUrl, String sessionId) {
        this.activity = activity;
        this.serverUrl = serverUrl;
        this.sessionId = sessionId;
        this.runtime = HotReloadRuntime.getInstance(activity);
        this.runtime.setActivity(activity);
        this.mainHandler = new Handler(Looper.getMainLooper());

        this.client = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(0, TimeUnit.SECONDS)   // No timeout for WebSocket
            .writeTimeout(10, TimeUnit.SECONDS)
            .build();
    }

    public void setReloadListener(ReloadListener listener) {
        this.reloadListener = listener;
    }

    public void connect() {
        String wsUrl = serverUrl.replace("http://", "ws://").replace("https://", "wss://");
        Log.d(TAG, "Connecting to dev server: " + wsUrl);

        Request request = new Request.Builder()
            .url(wsUrl)
            .build();

        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                Log.d(TAG, "WebSocket connected");
                isConnected = true;
                connectionTime = System.currentTimeMillis();
                ignoreFirstBuild = true;
                reconnectAttempts = 0;

                // Send connect message
                try {
                    JSONObject msg = new JSONObject();
                    msg.put("type", "client:connect");
                    msg.put("sessionId", sessionId);
                    msg.put("clientType", "test-app");
                    webSocket.send(msg.toString());
                } catch (Exception e) {
                    Log.e(TAG, "Failed to send connect message", e);
                }

                notifyConnectionState(true);
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                Log.d(TAG, "Received: " + text.substring(0, Math.min(200, text.length())));
                handleMessage(text);
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                Log.d(TAG, "WebSocket closing: " + code + " - " + reason);
                isConnected = false;
                notifyConnectionState(false);
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                Log.d(TAG, "WebSocket closed: " + code + " - " + reason);
                isConnected = false;
                notifyConnectionState(false);
                scheduleReconnect();
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                Log.e(TAG, "WebSocket error: " + t.getMessage());
                isConnected = false;
                notifyConnectionState(false);
                scheduleReconnect();
            }
        });
    }

    private void handleMessage(String text) {
        try {
            JSONObject json = new JSONObject(text);
            String type = json.optString("type", "");

            switch (type) {
                case "core:dex-reload":
                    handleDexReload(json);
                    break;

                case "core:build-complete":
                    handleBuildComplete(json);
                    break;

                case "core:reload":
                    handleReload();
                    break;

                case "ping":
                    sendPong();
                    break;

                default:
                    Log.d(TAG, "Unknown message type: " + type);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to parse message: " + e.getMessage());
        }
    }

    /**
     * Handle TRUE hot reload — DEX-based class swapping.
     */
    private void handleDexReload(JSONObject json) {
        mainHandler.post(() -> {
            try {
                notifyReloadStarted();

                String dexBase64 = json.optString("dexBase64", "");
                JSONArray classNamesArray = json.optJSONArray("classNames");
                List<String> classNames = new ArrayList<>();

                if (classNamesArray != null) {
                    for (int i = 0; i < classNamesArray.length(); i++) {
                        classNames.add(classNamesArray.getString(i));
                    }
                }

                Log.d(TAG, "🔥 DEX reload received: " + dexBase64.length() + " base64 chars, " + classNames.size() + " classes");

                if (!dexBase64.isEmpty()) {
                    Toast.makeText(activity, "🔥 True Hot Reload...", Toast.LENGTH_SHORT).show();
                    boolean success = runtime.loadDexAndReload(dexBase64, classNames);
                    notifyReloadComplete(success);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to handle dex reload", e);
                notifyReloadComplete(false);
            }
        });
    }

    /**
     * Handle full APK rebuild (SLOW — fallback for non-UI changes).
     */
    private void handleBuildComplete(JSONObject json) {
        if (ignoreFirstBuild) {
            Log.d(TAG, "Ignoring first build-complete (old build)");
            ignoreFirstBuild = false;
            return;
        }

        long timestamp = json.optLong("timestamp", 0);
        String downloadUrl = json.optString("downloadUrl", "");

        Log.d(TAG, "Build complete at " + timestamp + ", connection at " + connectionTime);
        Log.d(TAG, "Download URL: " + downloadUrl);

        // Only reload if build happened AFTER we connected
        if (timestamp > connectionTime && !downloadUrl.isEmpty()) {
            Log.d(TAG, "New build detected, downloading and installing APK");
            runtime.downloadAndInstallApk(downloadUrl);
        } else {
            Log.d(TAG, "Ignoring old build (timestamp before connection)");
        }
    }

    /**
     * Handle full activity restart.
     */
    private void handleReload() {
        Log.d(TAG, "Reload triggered!");
        mainHandler.post(() -> activity.recreate());
    }

    private void sendPong() {
        try {
            JSONObject msg = new JSONObject();
            msg.put("type", "pong");
            if (webSocket != null) {
                webSocket.send(msg.toString());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to send pong", e);
        }
    }

    private void scheduleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Log.w(TAG, "Max reconnect attempts reached");
            return;
        }

        reconnectAttempts++;
        long delay = Math.min(1000 * reconnectAttempts, 10000);
        Log.d(TAG, "Scheduling reconnect in " + delay + "ms (attempt " + reconnectAttempts + ")");

        mainHandler.postDelayed(this::connect, delay);
    }

    private void notifyConnectionState(boolean connected) {
        mainHandler.post(() -> {
            if (reloadListener != null) {
                reloadListener.onConnectionStateChanged(connected);
            }
        });
    }

    private void notifyReloadStarted() {
        if (reloadListener != null) {
            reloadListener.onReloadStarted();
        }
    }

    private void notifyReloadComplete(boolean success) {
        if (reloadListener != null) {
            reloadListener.onReloadComplete(success);
        }
    }

    public void disconnect() {
        if (webSocket != null) {
            webSocket.close(1000, "App closing");
            webSocket = null;
        }
        isConnected = false;
    }

    public WebSocket getWebSocket() {
        return webSocket;
    }

    public boolean isConnected() {
        return isConnected;
    }
}
