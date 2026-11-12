#include "audio/ConsoleAudioBackend.h"
#include "controller/DJController.h"
#include "view/ConsoleView.h"
#include <iostream>
#include <memory>

int main() {
    using namespace smartdj;
    auto backend = std::make_shared<ConsoleAudioBackend>();
    SmartDJModel model(backend);
    ConsoleView view;
    DJController controller(model, view);

    controller.loadDeckA({"Cairo Night", "music/cairo-night.mp3", 124.0});
    controller.loadDeckB({"Desert Lights", "music/desert-lights.mp3", 118.0});
    model.deckA().play();
    model.mixer().setCrossfader(0.0F);

    controller.autoBeatmatchSync();
    model.mixer().applyPreset("Club");
    model.presets().apply(EnvironmentPreset::ConcertHall);
    model.effects().echo(0.25F);
    controller.instrumentalOnly(2);
    controller.triggerDrop(1.6, 4);
    controller.autoCrossfade(2.0, 5); // Use 5.0 seconds in production.

    std::cout << "\nSimulation finished. Replace ConsoleAudioBackend with a JUCE/BASS adapter.\n";
    return 0;
}
