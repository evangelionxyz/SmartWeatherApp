# Linux application resources
# Install .desktop file and icon for desktop environments

set(APP_ICON_NAME "smartweatherapp")
set(APP_DESKTOP_FILE "${CMAKE_CURRENT_LIST_DIR}/smartweatherapp.desktop.in")
set(APP_ICON_FILE "${CMAKE_CURRENT_LIST_DIR}/app_icon.png")

# Configure the .desktop file with actual install paths
configure_file(
    "${APP_DESKTOP_FILE}"
    "${CMAKE_CURRENT_BINARY_DIR}/resources/linux/smartweatherapp.desktop"
    @ONLY
)

# Install the .desktop file to system applications directory
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/resources/linux/smartweatherapp.desktop"
    DESTINATION share/applications
)

# Install the icon to the standard icon directory
# Using 256x256 size - adjust if your icon is different
if(EXISTS "${APP_ICON_FILE}")
    install(FILES "${APP_ICON_FILE}"
        DESTINATION share/icons/hicolor/256x256/apps
        RENAME "${APP_ICON_NAME}.png"
    )
endif()
