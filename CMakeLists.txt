cmake_minimum_required(VERSION 3.20)
project(ForePlan VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin/${CMAKE_BUILD_TYPE})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib/${CMAKE_BUILD_TYPE})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib/${CMAKE_BUILD_TYPE})

set(THIRDPARTY_DIR ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty)

# CURL Options
set(BUILD_STATIC_LIBS ON CACHE BOOL "Use static linking for CURL" FORCE)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "Do not build CURL shared library" FORCE)
set(BUILD_CURL_EXE OFF CACHE BOOL "Do not build CURL executable" FORCE)
set(BUILD_CURL_DOCS OFF CACHE BOOL "Do not build CURL documentation" FORCE)
set(BUILD_CURL_MANUAL OFF CACHE BOOL "Do not build CURL manual" FORCE)
set(BUILD_CURL_TESTS OFF CACHE BOOL "Do not build CURL tests" FORCE)

# Disable optional dependencies to simplify build
set(CURL_DISABLE_LDAP ON CACHE BOOL "Disable LDAP" FORCE)
set(CURL_DISABLE_LDAPS ON CACHE BOOL "Disable LDAPS" FORCE)
set(CURL_USE_LIBPSL OFF CACHE BOOL "Disable libpsl" FORCE)
set(CURL_USE_LIBIDN2 OFF CACHE BOOL "Disable libidn2" FORCE)
set(CURL_ENABLE_SSL ON CACHE BOOL "Enable SSL" FORCE)

# Use platform-specific SSL backend
if(WIN32)
    set(CURL_USE_SCHANNEL ON CACHE BOOL "Use Windows Schannel for SSL" FORCE)
else()
    set(CURL_USE_OPENSSL ON CACHE BOOL "Use OpenSSL for SSL" FORCE)
endif()

add_subdirectory(${THIRDPARTY_DIR}/curl)

# Webview Options
find_package(Threads REQUIRED)
set(WEBVIEW_BUILD_STATIC_LIBRARY ON CACHE BOOL "Build webview static library" FORCE)
set(WEBVIEW_BUILD_SHARED_LIBRARY OFF CACHE BOOL "Disable webview shared library" FORCE)
set(WEBVIEW_BUILD_TESTS OFF CACHE BOOL "Disable webview tests" FORCE)
set(WEBVIEW_BUILD_EXAMPLES OFF CACHE BOOL "Disable webview examples" FORCE)
set(WEBVIEW_BUILD_DOCS OFF CACHE BOOL "Disable webview docs" FORCE)
add_subdirectory(${THIRDPARTY_DIR}/webview)
target_compile_definitions(webview_core_static PRIVATE _SILENCE_ALL_CXX23_DEPRECATION_WARNINGS _CXX23_DEPRECATE_ALIGNED_STORAGE)

# JSON
set(JSON_BuildTests OFF CACHE INTERNAL "")
set(JSON_Install OFF CACHE INTERNAL "")
set(JSON_MultipleHeaders OFF CACHE INTERNAL "")
add_subdirectory(${THIRDPARTY_DIR}/json EXCLUDE_FROM_ALL)

add_subdirectory(foreplan)