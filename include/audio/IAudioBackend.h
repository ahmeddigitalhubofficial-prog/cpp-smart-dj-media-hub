#pragma once

#include "audio/AudioTypes.h"

namespace smartdj {

// Adapter boundary. Replace this implementation with JUCE, BASS or FMOD.
class IAudioBackend {
public:
    virtual ~IAudioBackend() = default;
    virtual void load(int deckId, const Track& track) = 0;
    virtual void play(int deckId) = 0;
    virtual void pause(int deckId) = 0;
    virtual void setVolume(int deckId, float volume) = 0;
    virtual void setTempo(int deckId, double ratio) = 0;
    virtual void setEqualizer(const EqualizerSettings& equalizer) = 0;
    virtual void setEffect(EffectType effect, float amount) = 0;
    virtual void setStemMode(int deckId, StemMode mode) = 0;
};

} // namespace smartdj

