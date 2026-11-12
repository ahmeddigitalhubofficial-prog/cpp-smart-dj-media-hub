#pragma once
#include "audio/AudioEffects.h"
#include "audio/DJMixer.h"
#include <string>

namespace smartdj {
enum class EnvironmentPreset { Normal, Stadium, ConcertHall, TelephoneRadio, Underwater, BassBoost, VocalBoost };

class EnvironmentPresetManager {
public:
    EnvironmentPresetManager(DJMixer& mixer, AudioEffects& effects);
    void apply(EnvironmentPreset preset);
    static std::string displayName(EnvironmentPreset preset);
private:
    void reset();
    void setupStadium();
    void setupConcertHall();
    void setupTelephoneRadio();
    void setupUnderwater();
    void setupBassBoost();
    void setupVocalBoost();
    DJMixer& mixer_;
    AudioEffects& effects_;
};
} // namespace smartdj

