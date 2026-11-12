#pragma once

#include <string>

namespace smartdj {

enum class PlaybackState { Stopped, Playing, Paused };
enum class StemMode { FullMix, VocalOnly, InstrumentalOnly };
enum class EffectType { LowPass, HighPass, Echo, Reverb, Flanger };

struct Track {
    std::string title;
    std::string filePath;
    double bpm{120.0};
};

struct EqualizerSettings {
    float low{0.0F};   // -12 dB to +12 dB
    float mid{0.0F};
    float high{0.0F};
};

} // namespace smartdj
