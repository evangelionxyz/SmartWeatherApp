// Copyright (c) 2025 Evangelion Manuhutu

#ifndef WEATHER_HPP
#define WEATHER_HPP

#include <string>

namespace fp
{
    struct Weather
    {
        double temperature;
        double humidity;
        double windSpeed;
        std::string description;
    };
}

#endif