#pragma once

#include "audio/IAudioBackend.h"
#include <memory>

namespace smartdj {

class AudioDeck {
public:
    AudioDeck(int id, std::shared_ptr<IAudioBackend> backend);

    void loadTrack(const Track& track);
    void play();
    void pause();
    void setVolume(float volume);
    void setTempoRatio(double ratio);
    void setStemMode(StemMode mode);

    int id() const { return id_; }
    const Track& track() const { return track_; }
    double effectiveBpm() const { return track_.bpm * tempoRatio_; }
    float volume() const { return volume_; }
    PlaybackState state() const { return state_; }

private:
    int id_;
    Track track_;
    float volume_{1.0F};
    double tempoRatio_{1.0};
    PlaybackState state_{PlaybackState::Stopped};
    StemMode stemMode_{StemMode::FullMix};
    std::shared_ptr<IAudioBackend> backend_;
};

} // namespace smartdj

