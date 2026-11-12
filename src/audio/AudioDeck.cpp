#include "audio/AudioDeck.h"
#include <algorithm>
#include <stdexcept>

namespace smartdj {
AudioDeck::AudioDeck(int id, std::shared_ptr<IAudioBackend> backend) : id_(id), backend_(std::move(backend)) { if (!backend_) throw std::invalid_argument("Audio backend is required"); }
void AudioDeck::loadTrack(const Track& track) { track_ = track; tempoRatio_ = 1.0; state_ = PlaybackState::Stopped; backend_->load(id_, track_); }
void AudioDeck::play() { state_ = PlaybackState::Playing; backend_->play(id_); }
void AudioDeck::pause() { state_ = PlaybackState::Paused; backend_->pause(id_); }
void AudioDeck::setVolume(float volume) { volume_ = std::clamp(volume, 0.0F, 1.0F); backend_->setVolume(id_, volume_); }
void AudioDeck::setTempoRatio(double ratio) { tempoRatio_ = std::clamp(ratio, 0.5, 2.0); backend_->setTempo(id_, tempoRatio_); }
void AudioDeck::setStemMode(StemMode mode) { stemMode_ = mode; backend_->setStemMode(id_, mode); }
} // namespace smartdj

