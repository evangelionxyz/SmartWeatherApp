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
#include <webview/webview.h>
#include <curl/curl.h>

#ifdef _WIN32
    #include <windows.h>
#endif

/* OpenWeatherMap API usage:
 *  API call to request current weather and forecast data:
 *  https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API key}
 *
 *  API call to request historical data:
 *  https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={time}&appid={API key}
 *
 *  API call to request daily aggregation data:
 *  https://api.openweathermap.org/data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={date}&appid={API key}
 *
 *  API call to request weather overview with a human-readable weather summary:
 *  https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API key}
 */

inline std::string ReadAPIKey(const std::string &filePath, const std::string &keyName)
{
    std::ifstream apiKeyFile(filePath);
    if (!apiKeyFile)
    {
        std::cerr << "Failed to open API key file." << std::endl;
        return "";
    }

    std::string line;
    while (std::getline(apiKeyFile, line))
    {
        std::istringstream lineStream(line);
        std::string key, value;
        if (std::getline(lineStream, key, '=') && std::getline(lineStream, value))
        {
            if (key == keyName)
            {
                return value;
            }
        }
    }

    return "";
}

inline std::string GetReactDevUrl()
{
    return "http://localhost:5173";
}

size_t WriteCallback(void *contents, size_t size, size_t nmemb, std::string *output)
{
    size_t totalSize = size * nmemb;
    output->append((char *)contents, totalSize);
    return totalSize;
}

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
        smartweather::FileWatcher fileWatcher;
        
#ifdef _DEBUG
        webview::webview w(true, nullptr);
#else
        webview::webview w(false, nullptr);
#endif
        w.init("window.onerror = function(msg, url, line) { console.error('Error:', msg, 'at', url, ':', line); return true; };");
        w.set_title("Smart Weather App");
        w.set_size(1080, 640, WEBVIEW_HINT_NONE);

        // Weather API function
        auto GetWeatherData = [&]() -> std::string
        {
            const std::string apiKey = ReadAPIKey(".secrets", "OPENWEATHER_API_KEY");
            const std::string lat = "-6.2146";
            const std::string lon = "106.8451";
            std::string lang = "id";
            std::string units = "metric";
            const std::string url = std::format("https://api.openweathermap.org/data/3.0/onecall?lat={}&lon={}&units={}&lang={}&appid={}", lat, lon, units, lang, apiKey);

            CURL *curl = curl_easy_init();
            if (!curl)
            {
                return R"({"error": "Failed to initialize CURL"})";
            }

            std::string response;
            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

            CURLcode res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);

            if (res != CURLE_OK)
            {
                return std::format(R"({{"error": "CURL error: {}"}})", curl_easy_strerror(res));
            }

            return response;
        };

        w.bind("getWeather", [&](const std::string &req) -> std::string
        {
            return GetWeatherData();
        });

        w.bind("checkFileChanges", [&](const std::string &req) -> std::string
        {
            return fileWatcher.HasChanges() ? "true" : "false";
        });

        // Check if we should use React dev server or built files
        auto executableDir = smartweather::Utils::GetExecutableDir();
        auto reactDistPath = executableDir / "smartweatherapp" / "dist" / "index.html";

        std::cout << "Executable directory: " << executableDir.string() << std::endl;
        std::cout << "Current working directory: " << std::filesystem::current_path().string() << std::endl;
        std::cout << "Looking for React build at: " << reactDistPath.string() << std::endl;

        if (false && std::filesystem::exists(reactDistPath))
        {
            // Use React production build
            std::cout << "Using React production build from: " << reactDistPath.string() << std::endl;
            const std::string indexUrl = smartweather::Utils::ToFileUrl(reactDistPath);
            std::cout << "Navigating to: " << indexUrl << std::endl;
            w.navigate(indexUrl);
        }
        else
        {
            // Try React dev server
            std::cout << "No React build found at: " << reactDistPath.string() << std::endl;
            std::cout << "Trying React dev server at: " << GetReactDevUrl() << std::endl;
            std::cout << "Make sure to run 'npm run dev' in the frontend folder" << std::endl;
            
            // Use development URL
            w.navigate(GetReactDevUrl());
        }

        std::cout << "Starting webview..." << std::endl;
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