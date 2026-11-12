#include "controller/DJController.h"
#include <chrono>
#include <cmath>
#include <stdexcept>
#include <thread>

namespace smartdj {
DJController::DJController(SmartDJModel& model, IPlayerView& view) : model_(model), view_(view) {}
AudioDeck& DJController::deckById(int id) { if (id == 1) return model_.deckA(); if (id == 2) return model_.deckB(); throw std::invalid_argument("Deck id must be 1 or 2"); }
void DJController::loadDeckA(const Track& track) { model_.deckA().loadTrack(track); view_.showStatus("Deck A loaded: " + track.title); }
void DJController::loadDeckB(const Track& track) { model_.deckB().loadTrack(track); view_.showStatus("Deck B loaded: " + track.title); }
void DJController::autoBeatmatchSync() {
    const double target = model_.deckA().effectiveBpm();
    const double source = model_.deckB().track().bpm;
    if (source <= 0.0) throw std::runtime_error("Deck B BPM is invalid");
    model_.deckB().setTempoRatio(target / source);
    view_.showStatus("AUTO SYNC: Deck B matched to " + std::to_string(target) + " BPM");
}
void DJController::autoCrossfade(double seconds, int steps) {
    view_.showStatus("AUTO CROSSFADE started (equal-power curve)");
    model_.deckB().play();
    for (int i = 0; i <= steps; ++i) {
        const float progress = static_cast<float>(i) / steps;
        model_.mixer().setCrossfader(progress);
        view_.showProgress("Crossfade", progress);
        std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int>(seconds * 1000 / steps)));
    }
    model_.deckA().pause();
    view_.showStatus("Transition complete: Deck B is live");
}
void DJController::vocalOnly(int id) { deckById(id).setStemMode(StemMode::VocalOnly); view_.showStatus("AI STEM mock: Vocal Only"); }
void DJController::instrumentalOnly(int id) { deckById(id).setStemMode(StemMode::InstrumentalOnly); view_.showStatus("AI STEM mock: Instrumental Only"); }
void DJController::triggerDrop(double seconds, int steps) {
    view_.showStatus("DROP build-up started");
    for (int i = 0; i <= steps; ++i) {
        const float progress = static_cast<float>(i) / steps;
        model_.effects().lowPass(progress);
        view_.showProgress("Low-pass tension", progress);
        std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int>(seconds * 1000 / steps)));
    }
    model_.effects().lowPass(0.0F);
    view_.showStatus("DROP! Filter released to full energy");
}
} // namespace smartdj

