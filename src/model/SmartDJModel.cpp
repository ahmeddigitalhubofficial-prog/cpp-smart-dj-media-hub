#include "model/SmartDJModel.h"

namespace smartdj {
SmartDJModel::SmartDJModel(std::shared_ptr<IAudioBackend> backend)
    : deckA_(1, backend), deckB_(2, backend), mixer_(deckA_, deckB_, backend), effects_(backend), presets_(mixer_, effects_) {}
} // namespace smartdj
