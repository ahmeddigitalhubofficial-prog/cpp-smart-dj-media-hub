#include "audio/EnvironmentPresetManager.h"

namespace smartdj {
EnvironmentPresetManager::EnvironmentPresetManager(DJMixer& mixer, AudioEffects& effects) : mixer_(mixer), effects_(effects) {}
void EnvironmentPresetManager::apply(EnvironmentPreset preset) {
    reset();
    switch (preset) {
        case EnvironmentPreset::Normal: break;
        case EnvironmentPreset::Stadium: setupStadium(); break;
        case EnvironmentPreset::ConcertHall: setupConcertHall(); break;
        case EnvironmentPreset::TelephoneRadio: setupTelephoneRadio(); break;
        case EnvironmentPreset::Underwater: setupUnderwater(); break;
        case EnvironmentPreset::BassBoost: setupBassBoost(); break;
        case EnvironmentPreset::VocalBoost: setupVocalBoost(); break;
    }
}
void EnvironmentPresetManager::reset() { mixer_.setEqualizer({0,0,0}); effects_.clear(); }
void EnvironmentPresetManager::setupStadium() { mixer_.setEqualizer({2,-1,2}); effects_.echo(.82F); effects_.reverb(.95F); }
void EnvironmentPresetManager::setupConcertHall() { mixer_.setEqualizer({1.5F,2,1}); effects_.echo(.22F); effects_.reverb(.68F); }
void EnvironmentPresetManager::setupTelephoneRadio() { mixer_.setEqualizer({-12,5,-12}); effects_.highPass(.78F); effects_.lowPass(.70F); }
void EnvironmentPresetManager::setupUnderwater() { mixer_.setEqualizer({5,-3,-12}); effects_.lowPass(.96F); }
void EnvironmentPresetManager::setupBassBoost() { mixer_.setEqualizer({12,-1.5F,0}); }
void EnvironmentPresetManager::setupVocalBoost() { mixer_.setEqualizer({-2,8,2.5F}); }
std::string EnvironmentPresetManager::displayName(EnvironmentPreset preset) {
    switch (preset) {
        case EnvironmentPreset::Normal: return "Normal";
        case EnvironmentPreset::Stadium: return "Stadium";
        case EnvironmentPreset::ConcertHall: return "Concert Hall";
        case EnvironmentPreset::TelephoneRadio: return "Telephone / Radio";
        case EnvironmentPreset::Underwater: return "Underwater";
        case EnvironmentPreset::BassBoost: return "Bass Boost";
        case EnvironmentPreset::VocalBoost: return "Vocal Boost";
    }
    return "Unknown";
}
} // namespace smartdj

