#pragma once

#include "audio/AudioDeck.h"
#include <memory>

namespace smartdj {

class DJMixer {
public:
    DJMixer(AudioDeck& deckA, AudioDeck& deckB, std::shared_ptr<IAudioBackend> backend);
    void setCrossfader(float position);
    void setEqualizer(const EqualizerSettings& settings);
    void applyPreset(const std::string& presetName);

    float crossfader() const { return crossfader_; }
    const EqualizerSettings& equalizer() const { return equalizer_; }

private:
    AudioDeck& deckA_;
    AudioDeck& deckB_;
    float crossfader_{0.0F};
    EqualizerSettings equalizer_;
    std::shared_ptr<IAudioBackend> backend_;
};

} // namespace smartdj

