// Copyright (c) 2025 Evangelion Manuhutu

#ifndef FILEWATCHER_HPP
#define FILEWATCHER_HPP

#include <map>
#include <filesystem>

namespace fp
{
    class FileWatcher
    {
    public:
        void AddFile(const std::string& filepath) {
            if (std::filesystem::exists(filepath))
            {
                m_FileTimestamps[filepath] = std::filesystem::last_write_time(filepath);
            }
        }
        
        bool HasChanges()
        {
            for (auto& [filepath, timestamp] : m_FileTimestamps)
            {
                if (std::filesystem::exists(filepath))
                {
                    auto currentTime = std::filesystem::last_write_time(filepath);
                    if (currentTime != timestamp)
                    {
                        timestamp = currentTime;
                        return true;
                    }
                }
            }
            return false;
        }
    
    private:
        std::map<std::string, std::filesystem::file_time_type> m_FileTimestamps;
    };
}


#endif