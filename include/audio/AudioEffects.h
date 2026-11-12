#pragma once

#include "audio/IAudioBackend.h"
#include <memory>

namespace smartdj {

class AudioEffects {
public:
    explicit AudioEffects(std::shared_ptr<IAudioBackend> backend);
    void lowPass(float amount);
    void highPass(float amount);
    void echo(float amount);
    void reverb(float amount);
    void flanger(float amount);
    void clear();

private:
    std::shared_ptr<IAudioBackend> backend_;
};

} // namespace smartdj
