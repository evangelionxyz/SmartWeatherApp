file(GLOB_RECURSE SOURCE_FILES
    "src/*.cpp"
    "src/*.hpp"
)

add_executable(ForePlan MACOSX_BUNDLE WIN32)
target_sources(ForePlan PRIVATE ${SOURCE_FILES})

if(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/macos/resources.cmake)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/windows/resources.cmake)
    # Disable some warnings when using MSVC
    target_compile_definitions(ForePlan PRIVATE _CRT_SECURE_NO_WARNINGS)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/linux/resources.cmake)
endif()

target_include_directories(ForePlan PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
    "${THIRDPARTY_DIR}/curl/include"
    "${THIRDPARTY_DIR}/json/include"
    "${THIRDPARTY_DIR}/webview/core/include"
)

target_link_libraries(ForePlan PRIVATE
    libcurl
    nlohmann_json::nlohmann_json
    webview::core_static
    Threads::Threads
)


# define CURL_STATICLIB when using static curl
target_compile_definitions(ForePlan PRIVATE CURL_STATICLIB)

# Web build script
option(FOREPLAN_BUILD_WEB "Build the bundled React web" ON)

if(FOREPLAN_BUILD_WEB)
    set(WEB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/web)
    set(WEB_STAMP ${CMAKE_CURRENT_BINARY_DIR}/web_build.stamp)

    find_program(NPM_EXECUTABLE NAMES npm npm.cmd)

    if(NOT NPM_EXECUTABLE)
        message(WARNING "npm was not found; the React web will not be bundled.")
    else()
        file(GLOB_RECURSE WEB_SRC_FILES CONFIGURE_DEPENDS
            "${WEB_DIR}/src/*"
            "${WEB_DIR}/public/*"
        )

        set(WEB_DEPENDENCIES
            "${WEB_DIR}/package.json"
        )

        if(EXISTS "${WEB_DIR}/package-lock.json")
            list(APPEND WEB_DEPENDENCIES "${WEB_DIR}/package-lock.json")
        endif()

        list(APPEND WEB_DEPENDENCIES ${WEB_SRC_FILES})

        add_custom_command(
            OUTPUT ${WEB_STAMP}
            COMMAND ${NPM_EXECUTABLE} install
            COMMAND ${NPM_EXECUTABLE} run build
            COMMAND ${CMAKE_COMMAND} -E touch ${WEB_STAMP}
            WORKING_DIRECTORY ${WEB_DIR}
            DEPENDS ${WEB_DEPENDENCIES}
            COMMENT "Building React frontend"
            VERBATIM
        )

        add_custom_target(frontend_build DEPENDS ${WEB_STAMP})
        add_dependencies(ForePlan frontend_build)

        add_custom_command(TARGET ForePlan POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E remove_directory "$<TARGET_FILE_DIR:ForePlan>/web/dist"
            COMMAND ${CMAKE_COMMAND} -E make_directory "$<TARGET_FILE_DIR:ForePlan>/web"
            COMMAND ${CMAKE_COMMAND} -E copy_directory "${WEB_DIR}/dist" "$<TARGET_FILE_DIR:ForePlan>/web/dist"
            COMMENT "Copying React web bundle"
            VERBATIM
        )
    endif()
endif()