#pragma once

#include "audio/IAudioBackend.h"

namespace smartdj {

class ConsoleAudioBackend final : public IAudioBackend {
public:
    void load(int deckId, const Track& track) override;
    void play(int deckId) override;
    void pause(int deckId) override;
    void setVolume(int deckId, float volume) override;
    void setTempo(int deckId, double ratio) override;
    void setEqualizer(const EqualizerSettings& equalizer) override;
    void setEffect(EffectType effect, float amount) override;
    void setStemMode(int deckId, StemMode mode) override;
};

} // namespace smartdj

