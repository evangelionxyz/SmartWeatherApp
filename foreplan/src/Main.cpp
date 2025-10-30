// Copyright (c) 2025 Evangelion Manuhutu

#include "Filewatcher.hpp"
#include "Utils.hpp"

#include <iostream>
#include <string>
#include <format>
#include <thread>
#include <chrono>
#include <fstream>
#include <sstream>
#include <istream>
#include <filesystem>
#include <map>

#include <nlohmann/json.hpp>
#include <curl/curl.h>

#include <webview/webview.h>

#ifdef _WIN32
    #include <windows.h>
#endif

#ifdef _WIN32
int WINAPI WinMain(HINSTANCE /*hInst*/, HINSTANCE /*hPrevInst*/, LPSTR /*lpCmdLine*/, int /*nCmdShow*/) 
#else
int main(int argc, char **argv)
#endif
{
    try {
        // Configure WebView to allow file:// access and disable web security for local development
        // This allows ES modules and CORS requests from file:// protocol
#ifdef _WIN32
        SetEnvironmentVariableW(
            L"WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
            L"--allow-file-access-from-files --disable-web-security --allow-file-access --disable-features=CrossOriginOpenerPolicy"
        );
#elif defined(__linux__)
        // On Linux, WebKitGTK uses environment variables for webkit settings
        setenv("WEBKIT_DISABLE_COMPOSITING_MODE", "1", 1);
        // Note: WebKitGTK has different security policies than Chromium-based WebView2
        // File access and CORS are handled differently
#endif
        fp::FileWatcher fileWatcher;
        
#ifdef _DEBUG
        webview::webview w(true, nullptr);
#else
        webview::webview w(false, nullptr);
#endif
        w.init("window.onerror = function(msg, url, line) { console.error('Error:', msg, 'at', url, ':', line); return true; };");
        w.set_title("ForePlan");
        w.set_size(1280, 820, WEBVIEW_HINT_NONE);
        
        std::filesystem::path htmlPath = std::filesystem::current_path() / "web" / "dist" / "index.html";
        if (false && std::filesystem::exists(htmlPath)) {
            std::string fileUrl = "file://" + htmlPath.string();
            w.navigate(fileUrl);
        } else {
            // Fallback to localhost for development server
            w.navigate("http://localhost:5173");
        }
        w.run();
        return 0;
    } catch (const webview::exception &e) {
        std::cerr << "Webview error: " << e.what() << std::endl;
        return 1;
    } catch (const std::exception &e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}