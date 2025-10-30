// Copyright (c) 2025 Evangelion Manuhutu

#ifndef UTILS_HPP
#define UTILS_HPP

#include <array>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <filesystem>
#include <string>
#include <climits>

#if defined(_WIN32)
    #include <windows.h>
#elif defined(__APPLE__)
    #include <mach-o/dyld.h>
#else
    #include <unistd.h>
#endif

namespace fp::Utils
{
    inline std::string ReadFile(const std::filesystem::path& filepath)
    {
        std::ifstream file(filepath);
        if (!file.is_open())
        {
            throw std::runtime_error("Could not open file: " + filepath.string());
        }

        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }

    inline std::string ToFileUrl(const std::filesystem::path& filepath)
    {
        auto absolutePath = std::filesystem::absolute(filepath);
        std::string genericPath = absolutePath.generic_string();

        if (!genericPath.empty() && genericPath.front() != '/')
        {
            genericPath.insert(genericPath.begin(), '/');
        }

        return "file://" + genericPath;
    }

    inline std::filesystem::path GetExecutableDir()
    {
#if defined(_WIN32)
        std::wstring buffer(MAX_PATH, L'\0');
        DWORD length = GetModuleFileNameW(nullptr, buffer.data(), static_cast<DWORD>(buffer.size()));
        if (length == 0)
        {
            throw std::runtime_error("Failed to get executable path");
        }
        buffer.resize(length);
        return std::filesystem::path(buffer).parent_path();
#elif defined(__APPLE__)
        char buffer[PATH_MAX];
        uint32_t size = static_cast<uint32_t>(sizeof(buffer));
        if (_NSGetExecutablePath(buffer, &size) != 0)
        {
            std::string dynamicBuffer(size, '\0');
            _NSGetExecutablePath(dynamicBuffer.data(), &size);
            return std::filesystem::path(dynamicBuffer).parent_path();
        }
        return std::filesystem::path(buffer).parent_path();
#else
        std::array<char, PATH_MAX> buffer{};
        ssize_t length = readlink("/proc/self/exe", buffer.data(), buffer.size() - 1);
        if (length == -1)
        {
            throw std::runtime_error("Failed to get executable path");
        }
        buffer[length] = '\0';
        return std::filesystem::path(buffer.data()).parent_path();
#endif
    }

}

#endif