#include "audio/DJMixer.h"
#include <algorithm>
#include <cmath>

namespace smartdj {
DJMixer::DJMixer(AudioDeck& a, AudioDeck& b, std::shared_ptr<IAudioBackend> backend) : deckA_(a), deckB_(b), backend_(std::move(backend)) {}
void DJMixer::setCrossfader(float position) {
    crossfader_ = std::clamp(position, 0.0F, 1.0F);
    constexpr float halfPi = 1.5707963F;
    deckA_.setVolume(std::cos(crossfader_ * halfPi));
    deckB_.setVolume(std::sin(crossfader_ * halfPi));
}
void DJMixer::setEqualizer(const EqualizerSettings& settings) { equalizer_ = settings; backend_->setEqualizer(equalizer_); }
void DJMixer::applyPreset(const std::string& name) {
    if (name == "Rock") setEqualizer({4.0F, -1.0F, 3.0F});
    else if (name == "Cave") setEqualizer({6.0F, -4.0F, -7.0F});
    else if (name == "Club") setEqualizer({5.0F, 1.0F, 4.0F});
    else setEqualizer({0.0F, 0.0F, 0.0F});
}
} // namespace smartdj

