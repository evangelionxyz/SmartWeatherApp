file(GLOB_RECURSE SOURCE_FILES
    "src/*.cpp"
    "src/*.hpp"
)

add_executable(SmartWeatherApp MACOSX_BUNDLE WIN32)
target_sources(SmartWeatherApp PRIVATE ${SOURCE_FILES})

if(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/macos/resources.cmake)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/windows/resources.cmake)
    # Disable some warnings when using MSVC
    target_compile_definitions(SmartWeatherApp PRIVATE _CRT_SECURE_NO_WARNINGS)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    include(${CMAKE_CURRENT_SOURCE_DIR}/resources/linux/resources.cmake)
endif()

target_include_directories(SmartWeatherApp PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
    "${THIRDPARTY_DIR}/curl/include"
    "${THIRDPARTY_DIR}/json/include"
    "${THIRDPARTY_DIR}/webview/core/include"
)

target_link_libraries(SmartWeatherApp PRIVATE
    libcurl
    nlohmann_json::nlohmann_json
    webview::core_static
    Threads::Threads
)


# define CURL_STATICLIB when using static curl
target_compile_definitions(SmartWeatherApp PRIVATE CURL_STATICLIB)

# Frontend build script
option(SMARTWEATHERAPP_BUILD_FRONTEND "Build the bundled React frontend" ON)

if(SMARTWEATHERAPP_BUILD_FRONTEND)
    set(FRONTEND_DIR ${CMAKE_CURRENT_SOURCE_DIR}/frontend)
    set(FRONTEND_STAMP ${CMAKE_CURRENT_BINARY_DIR}/frontend_build.stamp)

    find_program(NPM_EXECUTABLE NAMES npm npm.cmd)

    if(NOT NPM_EXECUTABLE)
        message(WARNING "npm was not found; the React frontend will not be bundled.")
    else()
        file(GLOB_RECURSE FRONTEND_SRC_FILES CONFIGURE_DEPENDS
            "${FRONTEND_DIR}/src/*"
            "${FRONTEND_DIR}/public/*"
        )

        set(FRONTEND_DEPENDENCIES
            "${FRONTEND_DIR}/package.json"
        )

        if(EXISTS "${FRONTEND_DIR}/package-lock.json")
            list(APPEND FRONTEND_DEPENDENCIES "${FRONTEND_DIR}/package-lock.json")
        endif()

        list(APPEND FRONTEND_DEPENDENCIES ${FRONTEND_SRC_FILES})

        add_custom_command(
            OUTPUT ${FRONTEND_STAMP}
            COMMAND ${NPM_EXECUTABLE} install
            COMMAND ${NPM_EXECUTABLE} run build
            COMMAND ${CMAKE_COMMAND} -E touch ${FRONTEND_STAMP}
            WORKING_DIRECTORY ${FRONTEND_DIR}
            DEPENDS ${FRONTEND_DEPENDENCIES}
            COMMENT "Building React frontend"
            VERBATIM
        )

        add_custom_target(frontend_build DEPENDS ${FRONTEND_STAMP})
        add_dependencies(SmartWeatherApp frontend_build)

        add_custom_command(TARGET SmartWeatherApp POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E remove_directory "$<TARGET_FILE_DIR:SmartWeatherApp>/smartweatherapp/dist"
            COMMAND ${CMAKE_COMMAND} -E make_directory "$<TARGET_FILE_DIR:SmartWeatherApp>/smartweatherapp"
            COMMAND ${CMAKE_COMMAND} -E copy_directory "${FRONTEND_DIR}/dist" "$<TARGET_FILE_DIR:SmartWeatherApp>/smartweatherapp/dist"
            COMMENT "Copying React frontend bundle"
            VERBATIM
        )
    endif()
endif()