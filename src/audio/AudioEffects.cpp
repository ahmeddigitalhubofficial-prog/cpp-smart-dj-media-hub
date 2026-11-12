#include "audio/AudioEffects.h"
#include <algorithm>

namespace smartdj {
AudioEffects::AudioEffects(std::shared_ptr<IAudioBackend> backend) : backend_(std::move(backend)) {}
void AudioEffects::lowPass(float amount) { backend_->setEffect(EffectType::LowPass, std::clamp(amount, 0.0F, 1.0F)); }
void AudioEffects::highPass(float amount) { backend_->setEffect(EffectType::HighPass, std::clamp(amount, 0.0F, 1.0F)); }
void AudioEffects::echo(float amount) { backend_->setEffect(EffectType::Echo, std::clamp(amount, 0.0F, 1.0F)); }
void AudioEffects::reverb(float amount) { backend_->setEffect(EffectType::Reverb, std::clamp(amount, 0.0F, 1.0F)); }
void AudioEffects::flanger(float amount) { backend_->setEffect(EffectType::Flanger, std::clamp(amount, 0.0F, 1.0F)); }
void AudioEffects::clear() { lowPass(0); highPass(0); echo(0); reverb(0); flanger(0); }
} // namespace smartdj
