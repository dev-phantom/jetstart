package com.jetstart.hotreload;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/**
 * WebSocket client for receiving hot reload updates from the JetStart server.
 * Receives compiled dex bytes and triggers HotReloadRuntime to load them.
 */
public class HotReloadClient {
    private static final String TAG = "HotReloadClient";

    private final Context context;
    private final String serverUrl;
    private final String sessionId;
    private final HotReloadRuntime runtime;

    private OkHttpClient client;
    private WebSocket webSocket;
    private Handler mainHandler;
    private boolean isConnected = false;
    private int reconnectAttempts = 0;
    private static final int MAX_RECONNECT_ATTEMPTS = 10;

    public interface ReloadListener {
        void onReloadStarted();
        void onReloadComplete(boolean success);
        void onConnectionStateChanged(boolean connected);
    }

    private ReloadListener reloadListener;

    public HotReloadClient(Context context, String serverUrl, String sessionId) {
        this.context = context.getApplicationContext();
        this.serverUrl = serverUrl;
        this.sessionId = sessionId;
        this.runtime = HotReloadRuntime.getInstance(context);
        this.mainHandler = new Handler(Looper.getMainLooper());

        this.client = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(0, TimeUnit.SECONDS) // No timeout for WebSocket
            .writeTimeout(10, TimeUnit.SECONDS)
            .build();
    }

    public void setReloadListener(ReloadListener listener) {
        this.reloadListener = listener;
    }

    public void connect() {
        String url = serverUrl + "?session=" + sessionId + "&type=app";
        Log.d(TAG, "Connecting to: " + url);

        Request request = new Request.Builder()
            .url(url)
            .build();

        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                Log.d(TAG, "WebSocket connected");
                isConnected = true;
                reconnectAttempts = 0;

                // Send registration message
                try {
                    JSONObject msg = new JSONObject();
                    msg.put("type", "register");
                    msg.put("clientType", "app");
                    msg.put("sessionId", sessionId);
                    msg.put("supportsHotReload", true);
                    webSocket.send(msg.toString());
                } catch (Exception e) {
                    Log.e(TAG, "Failed to send registration", e);
                }

                notifyConnectionState(true);
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                Log.d(TAG, "Received message: " + text.substring(0, Math.min(200, text.length())));
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
                Log.e(TAG, "WebSocket failure", t);
                isConnected = false;
                notifyConnectionState(false);
                scheduleReconnect();
            }
        });
    }

    private void handleMessage(String text) {
        try {
            JSONObject msg = new JSONObject(text);
            String type = msg.optString("type", "");

            switch (type) {
                case "hot-reload":
                    handleHotReload(msg);
                    break;
                case "dex-reload":
                    handleDexReload(msg);
                    break;
                case "ping":
                    sendPong();
                    break;
                default:
                    Log.d(TAG, "Unknown message type: " + type);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to handle message", e);
        }
    }

    /**
     * Handle a hot reload message containing compiled dex bytes.
     * Message format:
     * {
     *   "type": "dex-reload",
     *   "dexBase64": "base64-encoded-dex-bytes",
     *   "classNames": ["com.example.MyClass", ...],
     *   "timestamp": 123456789
     * }
     */
    private void handleDexReload(JSONObject msg) {
        mainHandler.post(() -> {
            try {
                notifyReloadStarted();

                String dexBase64 = msg.getString("dexBase64");
                JSONArray classNamesArray = msg.getJSONArray("classNames");

                byte[] dexBytes = Base64.decode(dexBase64, Base64.DEFAULT);
                String[] classNames = new String[classNamesArray.length()];
                for (int i = 0; i < classNamesArray.length(); i++) {
                    classNames[i] = classNamesArray.getString(i);
                }

                Log.d(TAG, "Received dex reload: " + dexBytes.length + " bytes, " + classNames.length + " classes");

                boolean success = runtime.loadReloadDex(dexBytes, classNames);

                notifyReloadComplete(success);

                // Send acknowledgment
                sendReloadAck(success, msg.optLong("timestamp", 0));

            } catch (Exception e) {
                Log.e(TAG, "Failed to handle dex reload", e);
                notifyReloadComplete(false);
            }
        });
    }

    /**
     * Handle legacy hot-reload message (DSL-based, for backwards compatibility)
     */
    private void handleHotReload(JSONObject msg) {
        Log.d(TAG, "Received legacy DSL hot-reload (ignoring for true hot reload)");
        // Legacy DSL-based reload - we're now using dex-based reload
    }

    private void sendReloadAck(boolean success, long timestamp) {
        try {
            JSONObject msg = new JSONObject();
            msg.put("type", "reload-ack");
            msg.put("success", success);
            msg.put("timestamp", timestamp);
            if (webSocket != null) {
                webSocket.send(msg.toString());
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to send reload ack", e);
        }
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
            webSocket.close(1000, "Client disconnecting");
            webSocket = null;
        }
        isConnected = false;
    }

    public boolean isConnected() {
        return isConnected;
    }
}
