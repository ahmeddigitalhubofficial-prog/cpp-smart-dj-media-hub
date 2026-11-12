#pragma once

#include "model/SmartDJModel.h"
#include "view/IPlayerView.h"

namespace smartdj {

// Controller contains the one-button automated DJ workflows.
class DJController {
public:
    DJController(SmartDJModel& model, IPlayerView& view);

    void loadDeckA(const Track& track);
    void loadDeckB(const Track& track);
    void autoBeatmatchSync();
    void autoCrossfade(double durationSeconds, int simulationSteps = 10);
    void vocalOnly(int deckId);
    void instrumentalOnly(int deckId);
    void triggerDrop(double buildSeconds, int simulationSteps = 8);

private:
    AudioDeck& deckById(int deckId);
    SmartDJModel& model_;
    IPlayerView& view_;
};

} // namespace smartdj

