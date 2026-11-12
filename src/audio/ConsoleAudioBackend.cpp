#include "audio/ConsoleAudioBackend.h"
#include <iostream>

namespace smartdj {
void ConsoleAudioBackend::load(int id, const Track& t) { std::cout << "[Audio API] Deck " << id << " load: " << t.filePath << '\n'; }
void ConsoleAudioBackend::play(int id) { std::cout << "[Audio API] Deck " << id << " play\n"; }
void ConsoleAudioBackend::pause(int id) { std::cout << "[Audio API] Deck " << id << " pause\n"; }
void ConsoleAudioBackend::setVolume(int id, float v) { std::cout << "[DSP] Deck " << id << " volume = " << v << '\n'; }
void ConsoleAudioBackend::setTempo(int id, double r) { std::cout << "[Time Stretch] Deck " << id << " ratio = " << r << '\n'; }
void ConsoleAudioBackend::setEqualizer(const EqualizerSettings& e) { std::cout << "[EQ] Low " << e.low << " dB, Mid " << e.mid << " dB, High " << e.high << " dB\n"; }
void ConsoleAudioBackend::setEffect(EffectType e, float a) { std::cout << "[Effect] type=" << static_cast<int>(e) << " amount=" << a << '\n'; }
void ConsoleAudioBackend::setStemMode(int id, StemMode m) { std::cout << "[AI Stem placeholder] Deck " << id << " mode=" << static_cast<int>(m) << '\n'; }
} // namespace smartdj

