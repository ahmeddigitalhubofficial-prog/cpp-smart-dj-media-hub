#pragma once

#include "audio/AudioEffects.h"
#include "audio/DJMixer.h"
#include "audio/EnvironmentPresetManager.h"

namespace smartdj {

// Model owns all application state and domain services.
class SmartDJModel {
public:
    explicit SmartDJModel(std::shared_ptr<IAudioBackend> backend);

    AudioDeck& deckA() { return deckA_; }
    AudioDeck& deckB() { return deckB_; }
    DJMixer& mixer() { return mixer_; }
    AudioEffects& effects() { return effects_; }
    EnvironmentPresetManager& presets() { return presets_; }

private:
    AudioDeck deckA_;
    AudioDeck deckB_;
    DJMixer mixer_;
    AudioEffects effects_;
    EnvironmentPresetManager presets_;
};

} // namespace smartdj
